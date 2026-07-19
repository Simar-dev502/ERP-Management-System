const express = require('express');
const { body } = require('express-validator');
const { getGRNs, getGRN, createGRN, deleteGRN } = require('../controllers/grnController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getGRNs)
  .post(
    authorize('admin', 'inventory'),
    [
      body('purchaseOrder').isMongoId().withMessage('Valid purchase order ID is required'),
      body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
      body('items.*.product').isMongoId().withMessage('Valid product ID is required'),
      body('items.*.orderedQuantity').isInt({ min: 1 }).withMessage('Ordered quantity must be at least 1'),
      body('items.*.receivedQuantity').isInt({ min: 0 }).withMessage('Received quantity must be non-negative'),
      body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be non-negative'),
    ],
    validate,
    createGRN,
  );

router.route('/:id').get(getGRN).delete(authorize('admin'), deleteGRN);

module.exports = router;