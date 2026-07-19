const express = require('express');
const { body } = require('express-validator');
const {
  getSalesOrders,
  getSalesOrder,
  createSalesOrder,
  updateSalesOrderStatus,
  deleteSalesOrder,
} = require('../controllers/salesOrderController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getSalesOrders)
  .post(
    authorize('admin', 'sales'),
    [
      body('customer').isMongoId().withMessage('Valid customer ID is required'),
      body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
      body('items.*.product').isMongoId().withMessage('Valid product ID is required'),
      body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
      body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    ],
    validate,
    createSalesOrder,
  );

router.route('/:id').get(getSalesOrder).delete(authorize('admin'), deleteSalesOrder);

router.put(
  '/:id/status',
  authorize('admin', 'sales'),
  [body('status').isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status')],
  validate,
  updateSalesOrderStatus,
);

module.exports = router;