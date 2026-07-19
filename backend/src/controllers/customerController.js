const Customer = require('../models/Customer');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
const getCustomers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const { search, sort = '-createdAt', isActive } = req.query;

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const sortOptions = {};
  const sortFields = sort.split(',');
  sortFields.forEach((field) => {
    sortOptions[field.startsWith('-') ? field.substring(1) : field] = field.startsWith('-') ? -1 : 1;
  });

  const customers = await Customer.find(filter).sort(sortOptions).skip(skip).limit(limit);
  const total = await Customer.countDocuments(filter);

  res.json({
    success: true,
    count: customers.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: customers,
  });
});

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) throw new ApiError(404, 'Customer not found');
  res.json({ success: true, data: customer });
});

// @desc    Create customer
// @route   POST /api/customers
// @access  Private/Admin, Sales
const createCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.create(req.body);
  res.status(201).json({ success: true, data: customer });
});

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private/Admin, Sales
const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!customer) throw new ApiError(404, 'Customer not found');
  res.json({ success: true, data: customer });
});

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private/Admin
const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);
  if (!customer) throw new ApiError(404, 'Customer not found');
  res.json({ success: true, message: 'Customer deleted successfully' });
});

module.exports = { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };