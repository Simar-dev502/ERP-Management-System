const Supplier = require('../models/Supplier');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = asyncHandler(async (req, res) => {
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

  const suppliers = await Supplier.find(filter).sort(sortOptions).skip(skip).limit(limit);
  const total = await Supplier.countDocuments(filter);

  res.json({
    success: true,
    count: suppliers.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: suppliers,
  });
});

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
// @access  Private
const getSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) throw new ApiError(404, 'Supplier not found');
  res.json({ success: true, data: supplier });
});

// @desc    Create supplier
// @route   POST /api/suppliers
// @access  Private/Admin, Purchase
const createSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.create(req.body);
  res.status(201).json({ success: true, data: supplier });
});

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private/Admin, Purchase
const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!supplier) throw new ApiError(404, 'Supplier not found');
  res.json({ success: true, data: supplier });
});

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private/Admin
const deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByIdAndDelete(req.params.id);
  if (!supplier) throw new ApiError(404, 'Supplier not found');
  res.json({ success: true, message: 'Supplier deleted successfully' });
});

module.exports = { getSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier };