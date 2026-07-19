const SalesOrder = require('../models/SalesOrder');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Get all sales orders
// @route   GET /api/sales-orders
// @access  Private
const getSalesOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const { search, sort = '-createdAt', status, customer } = req.query;

  const filter = {};
  if (search) {
    filter.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
    ];
  }
  if (status) filter.status = status;
  if (customer) filter.customer = customer;

  const sortOptions = {};
  const sortFields = sort.split(',');
  sortFields.forEach((field) => {
    sortOptions[field.startsWith('-') ? field.substring(1) : field] = field.startsWith('-') ? -1 : 1;
  });

  const orders = await SalesOrder.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .populate('customer', 'name email phone')
    .populate('items.product', 'title sku')
    .populate('createdBy', 'name');

  const total = await SalesOrder.countDocuments(filter);

  res.json({
    success: true,
    count: orders.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: orders,
  });
});

// @desc    Get single sales order
// @route   GET /api/sales-orders/:id
// @access  Private
const getSalesOrder = asyncHandler(async (req, res) => {
  const order = await SalesOrder.findById(req.params.id)
    .populate('customer', 'name email phone address gstNo')
    .populate('items.product', 'title sku price')
    .populate('createdBy', 'name');

  if (!order) throw new ApiError(404, 'Sales order not found');
  res.json({ success: true, data: order });
});

// @desc    Create sales order
// @route   POST /api/sales-orders
// @access  Private/Admin, Sales
const createSalesOrder = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user._id;
  const order = await SalesOrder.create(req.body);
  const populated = await SalesOrder.findById(order._id)
    .populate('customer', 'name email phone')
    .populate('items.product', 'title sku')
    .populate('createdBy', 'name');

  res.status(201).json({ success: true, data: populated });
});

// @desc    Update sales order status
// @route   PUT /api/sales-orders/:id/status
// @access  Private/Admin, Sales
const updateSalesOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await SalesOrder.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Sales order not found');

  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
  };

  if (!validTransitions[order.status].includes(status)) {
    throw new ApiError(400, `Cannot transition from '${order.status}' to '${status}'`);
  }

  order.status = status;
  await order.save();

  const populated = await SalesOrder.findById(order._id)
    .populate('customer', 'name email phone')
    .populate('items.product', 'title sku')
    .populate('createdBy', 'name');

  res.json({ success: true, data: populated });
});

// @desc    Delete sales order
// @route   DELETE /api/sales-orders/:id
// @access  Private/Admin
const deleteSalesOrder = asyncHandler(async (req, res) => {
  const order = await SalesOrder.findByIdAndDelete(req.params.id);
  if (!order) throw new ApiError(404, 'Sales order not found');
  res.json({ success: true, message: 'Sales order deleted successfully' });
});

module.exports = { getSalesOrders, getSalesOrder, createSalesOrder, updateSalesOrderStatus, deleteSalesOrder };