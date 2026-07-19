const express = require('express');
const { body } = require('express-validator');
const {
  getPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  deletePurchaseOrder,
} = require('../controllers/purchaseOrderController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getPurchaseOrders)
  .post(
    authorize('admin', 'purchase'),
    [
      body('supplier').isMongoId().withMessage('Valid supplier ID is required'),
      body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
      body('items.*.product').isMongoId().withMessage('Valid product ID is required'),
      body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
      body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    ],
    validate,
    createPurchaseOrder,
  );

router.route('/:id').get(getPurchaseOrder).delete(authorize('admin'), deletePurchaseOrder);

router.put(
  '/:id/status',
  authorize('admin', 'purchase'),
  [body('status').isIn(['pending', 'confirmed', 'shipped', 'received', 'cancelled']).withMessage('Invalid status')],
  validate,
  updatePurchaseOrderStatus,
);

module.exports = router;