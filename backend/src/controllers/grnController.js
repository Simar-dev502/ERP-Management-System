const GRN = require('../models/GRN');
const Product = require('../models/Product');
const PurchaseOrder = require('../models/PurchaseOrder');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Get all GRNs
// @route   GET /api/grn
// @access  Private
const getGRNs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const { search, sort = '-createdAt', purchaseOrder } = req.query;

  const filter = {};
  if (search) filter.$or = [{ grnNumber: { $regex: search, $options: 'i' } }];
  if (purchaseOrder) filter.purchaseOrder = purchaseOrder;

  const sortOptions = {};
  const sortFields = sort.split(',');
  sortFields.forEach((field) => {
    sortOptions[field.startsWith('-') ? field.substring(1) : field] = field.startsWith('-') ? -1 : 1;
  });

  const grns = await GRN.find(filter)
    .sort(sortOptions).skip(skip).limit(limit)
    .populate('purchaseOrder', 'orderNumber')
    .populate('supplier', 'name')
    .populate('items.product', 'title sku')
    .populate('receivedBy', 'name');

  const total = await GRN.countDocuments(filter);
  res.json({ success: true, count: grns.length, total, totalPages: Math.ceil(total / limit), currentPage: page, data: grns });
});

// @desc    Get single GRN
// @route   GET /api/grn/:id
// @access  Private
const getGRN = asyncHandler(async (req, res) => {
  const grn = await GRN.findById(req.params.id)
    .populate('purchaseOrder', 'orderNumber')
    .populate('supplier', 'name email phone address')
    .populate('items.product', 'title sku price')
    .populate('receivedBy', 'name');
  if (!grn) throw new ApiError(404, 'GRN not found');
  res.json({ success: true, data: grn });
});

// @desc    Create GRN (and increment product stock atomically)
// @route   POST /api/grn
// @access  Private/Admin, Inventory
const createGRN = asyncHandler(async (req, res) => {
  const { purchaseOrder: poId, items } = req.body;

  // Verify purchase order exists
  const purchaseOrder = await PurchaseOrder.findById(poId);
  if (!purchaseOrder) throw new ApiError(404, 'Purchase order not found');

  // Auto-set supplier from PO
  req.body.supplier = purchaseOrder.supplier;
  req.body.receivedBy = req.user._id;

  // Atomically increment stock for each product
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) throw new ApiError(404, `Product ${item.product} not found`);

    product.stock += item.receivedQuantity;
    await product.save();
  }

  const grn = await GRN.create(req.body);

  // Update PO status to received
  purchaseOrder.status = 'received';
  await purchaseOrder.save();

  const populated = await GRN.findById(grn._id)
    .populate('purchaseOrder', 'orderNumber')
    .populate('supplier', 'name')
    .populate('items.product', 'title sku')
    .populate('receivedBy', 'name');

  res.status(201).json({ success: true, data: populated });
});

// @desc    Delete GRN
// @route   DELETE /api/grn/:id
// @access  Private/Admin
const deleteGRN = asyncHandler(async (req, res) => {
  const grn = await GRN.findByIdAndDelete(req.params.id);
  if (!grn) throw new ApiError(404, 'GRN not found');
  res.json({ success: true, message: 'GRN deleted successfully' });
});

module.exports = { getGRNs, getGRN, createGRN, deleteGRN };