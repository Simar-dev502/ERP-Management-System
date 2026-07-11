const PurchaseOrder = require('../models/PurchaseOrder');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Get all purchase orders
// @route   GET /api/purchase-orders
// @access  Private
const getPurchaseOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const { search, sort = '-createdAt', status, supplier } = req.query;

  const filter = {};
  if (search) filter.$or = [{ orderNumber: { $regex: search, $options: 'i' } }];
  if (status) filter.status = status;
  if (supplier) filter.supplier = supplier;

  const sortOptions = {};
  const sortFields = sort.split(',');
  sortFields.forEach((field) => {
    sortOptions[field.startsWith('-') ? field.substring(1) : field] = field.startsWith('-') ? -1 : 1;
  });

  const orders = await PurchaseOrder.find(filter)
    .sort(sortOptions).skip(skip).limit(limit)
    .populate('supplier', 'name email phone')
    .populate('items.product', 'title sku')
    .populate('createdBy', 'name');

  const total = await PurchaseOrder.countDocuments(filter);
  res.json({ success: true, count: orders.length, total, totalPages: Math.ceil(total / limit), currentPage: page, data: orders });
});

// @desc    Get single purchase order
// @route   GET /api/purchase-orders/:id
// @access  Private
const getPurchaseOrder = asyncHandler(async (req, res) => {
  const order = await PurchaseOrder.findById(req.params.id)
    .populate('supplier', 'name email phone address gstNo')
    .populate('items.product', 'title sku price')
    .populate('createdBy', 'name');
  if (!order) throw new ApiError(404, 'Purchase order not found');
  res.json({ success: true, data: order });
});

// @desc    Create purchase order
// @route   POST /api/purchase-orders
// @access  Private/Admin, Purchase
const createPurchaseOrder = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user._id;
  const order = await PurchaseOrder.create(req.body);
  const populated = await PurchaseOrder.findById(order._id)
    .populate('supplier', 'name email phone')
    .populate('items.product', 'title sku')
    .populate('createdBy', 'name');
  res.status(201).json({ success: true, data: populated });
});

// @desc    Update purchase order status
// @route   PUT /api/purchase-orders/:id/status
// @access  Private/Admin, Purchase
const updatePurchaseOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await PurchaseOrder.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Purchase order not found');

  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['received', 'cancelled'],
    received: [],
    cancelled: [],
  };

  if (!validTransitions[order.status].includes(status)) {
    throw new ApiError(400, `Cannot transition from '${order.status}' to '${status}'`);
  }

  order.status = status;
  await order.save();

  const populated = await PurchaseOrder.findById(order._id)
    .populate('supplier', 'name email phone')
    .populate('items.product', 'title sku')
    .populate('createdBy', 'name');
  res.json({ success: true, data: populated });
});

// @desc    Delete purchase order
// @route   DELETE /api/purchase-orders/:id
// @access  Private/Admin
const deletePurchaseOrder = asyncHandler(async (req, res) => {
  const order = await PurchaseOrder.findByIdAndDelete(req.params.id);
  if (!order) throw new ApiError(404, 'Purchase order not found');
  res.json({ success: true, message: 'Purchase order deleted successfully' });
});

module.exports = { getPurchaseOrders, getPurchaseOrder, createPurchaseOrder, updatePurchaseOrderStatus, deletePurchaseOrder };