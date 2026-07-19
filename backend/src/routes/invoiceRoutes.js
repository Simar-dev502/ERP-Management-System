const express = require('express');
const { body } = require('express-validator');
const {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoiceStatus,
  deleteInvoice,
} = require('../controllers/invoiceController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getInvoices)
  .post(
    authorize('admin', 'sales'),
    [
      body('salesOrder').isMongoId().withMessage('Valid sales order ID is required'),
      body('taxRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Tax rate must be between 0 and 100'),
    ],
    validate,
    createInvoice,
  );

router.route('/:id').get(getInvoice).delete(authorize('admin'), deleteInvoice);

router.put(
  '/:id/status',
  authorize('admin', 'sales'),
  [body('status').isIn(['paid', 'unpaid', 'overdue', 'cancelled']).withMessage('Invalid status')],
  validate,
  updateInvoiceStatus,
);

module.exports = router;