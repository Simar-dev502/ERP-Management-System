const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const SalesOrder = require('../models/SalesOrder');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = asyncHandler(async (_req, res) => {
  const [
    totalProducts,
    totalCustomers,
    totalSuppliers,
    totalSalesOrders,
    totalPurchaseOrders,
    lowStockProducts,
    salesOrdersByStatus,
  ] = await Promise.all([
    Product.countDocuments(),
    Customer.countDocuments(),
    Supplier.countDocuments(),
    SalesOrder.countDocuments(),
    require('../models/PurchaseOrder').countDocuments(),
    Product.countDocuments({ $expr: { $lte: ['$stock', '$reorderLevel'] } }),
    SalesOrder.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  // Monthly sales trend (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlySales = await SalesOrder.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        total: { $sum: '$totalPrice' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        total: 1,
        count: 1,
      },
    },
  ]);

  // Top 5 products by total quantity sold
  const topProducts = await SalesOrder.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        totalSold: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        productId: '$_id',
        title: '$product.title',
        sku: '$product.sku',
        totalSold: 1,
        revenue: 1,
      },
    },
  ]);

  // Build status counts
  const statusCounts = { pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 };
  salesOrdersByStatus.forEach((item) => {
    statusCounts[item._id] = item.count;
  });

  res.json({
    success: true,
    data: {
      totalProducts,
      totalCustomers,
      totalSuppliers,
      totalSalesOrders,
      totalPurchaseOrders,
      lowStockProducts,
      orderStatusCounts: statusCounts,
      monthlySales,
      topProducts,
    },
  });
});

module.exports = { getDashboardStats };