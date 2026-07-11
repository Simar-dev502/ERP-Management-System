const express = require('express');
const { body } = require('express-validator');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validate');

const router = express.Router();

// All routes require authentication
router.use(protect);

router
  .route('/')
  .get(getProducts)
  .post(
    authorize('admin', 'inventory'),
    [
      body('title').trim().notEmpty().withMessage('Title is required'),
      body('sku').trim().notEmpty().withMessage('SKU is required'),
      body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
      body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
      body('reorderLevel')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Reorder level must be a non-negative integer'),
      body('category').trim().notEmpty().withMessage('Category is required'),
    ],
    validate,
    createProduct,
  );

router
  .route('/:id')
  .get(getProduct)
  .put(
    authorize('admin', 'inventory'),
    [
      body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
      body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
      body('stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Stock must be a non-negative integer'),
    ],
    validate,
    updateProduct,
  )
  .delete(authorize('admin', 'inventory'), deleteProduct);

module.exports = router;