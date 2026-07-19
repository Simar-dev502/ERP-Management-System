const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Get all products (with pagination, search, sort, filter)
// @route   GET /api/products
// @access  Private
const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    sort = '-createdAt',
    category,
    minPrice,
    maxPrice,
    lowStock,
    isActive,
  } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Build filter query
  const filter = {};

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) {
    filter.category = category;
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  if (lowStock === 'true') {
    filter.$expr = { $lte: ['$stock', '$reorderLevel'] };
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  // Build sort
  const sortOptions = {};
  const sortFields = sort.split(',');
  sortFields.forEach((field) => {
    if (field.startsWith('-')) {
      sortOptions[field.substring(1)] = -1;
    } else {
      sortOptions[field] = 1;
    }
  });

  const products = await Product.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum);

  const total = await Product.countDocuments(filter);

  res.json({
    success: true,
    count: products.length,
    total,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    data: products,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.json({
    success: true,
    data: product,
  });
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin, Inventory
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    data: product,
  });
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin, Inventory
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.json({
    success: true,
    data: product,
  });
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin, Inventory
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.json({
    success: true,
    message: 'Product deleted successfully',
  });
});

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };