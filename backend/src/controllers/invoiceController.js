const Invoice = require('../models/Invoice');
const SalesOrder = require('../models/SalesOrder');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
const getInvoices = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const { search, sort = '-createdAt', status, customer } = req.query;

  const filter = {};
  if (search) filter.$or = [{ invoiceNumber: { $regex: search, $options: 'i' } }];
  if (status) filter.status = status;
  if (customer) filter.customer = customer;

  const sortOptions = {};
  const sortFields = sort.split(',');
  sortFields.forEach((field) => {
    sortOptions[field.startsWith('-') ? field.substring(1) : field] = field.startsWith('-') ? -1 : 1;
  });

  const invoices = await Invoice.find(filter)
    .sort(sortOptions).skip(skip).limit(limit)
    .populate('customer', 'name email phone')
    .populate('salesOrder', 'orderNumber')
    .populate('items.product', 'title sku')
    .populate('createdBy', 'name');

  const total = await Invoice.countDocuments(filter);
  res.json({ success: true, count: invoices.length, total, totalPages: Math.ceil(total / limit), currentPage: page, data: invoices });
});

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('customer', 'name email phone address gstNo')
    .populate('salesOrder', 'orderNumber')
    .populate('items.product', 'title sku price')
    .populate('createdBy', 'name');
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  res.json({ success: true, data: invoice });
});

// @desc    Create invoice from sales order
// @route   POST /api/invoices
// @access  Private/Admin, Sales
const createInvoice = asyncHandler(async (req, res) => {
  const { salesOrder: soId, taxRate, dueDate, notes } = req.body;

  const salesOrder = await SalesOrder.findById(soId).populate('items.product', 'title sku price');
  if (!salesOrder) throw new ApiError(404, 'Sales order not found');

  const items = salesOrder.items.map((item) => ({
    product: item.product._id,
    description: item.product.title,
    quantity: item.quantity,
    price: item.price,
  }));

  req.body.customer = salesOrder.customer;
  req.body.items = items;
  req.body.createdBy = req.user._id;

  const invoice = await Invoice.create(req.body);

  const populated = await Invoice.findById(invoice._id)
    .populate('customer', 'name email phone')
    .populate('salesOrder', 'orderNumber')
    .populate('items.product', 'title sku')
    .populate('createdBy', 'name');

  res.status(201).json({ success: true, data: populated });
});

// @desc    Update invoice status
// @route   PUT /api/invoices/:id/status
// @access  Private/Admin, Sales
const updateInvoiceStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const invoice = await Invoice.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true },
  )
    .populate('customer', 'name email phone')
    .populate('salesOrder', 'orderNumber')
    .populate('items.product', 'title sku')
    .populate('createdBy', 'name');

  if (!invoice) throw new ApiError(404, 'Invoice not found');
  res.json({ success: true, data: invoice });
});

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private/Admin
const deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findByIdAndDelete(req.params.id);
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  res.json({ success: true, message: 'Invoice deleted successfully' });
});

module.exports = { getInvoices, getInvoice, createInvoice, updateInvoiceStatus, deleteInvoice };