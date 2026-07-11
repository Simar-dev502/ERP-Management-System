const express = require('express');
const { body } = require('express-validator');
const {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require('../controllers/supplierController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getSuppliers)
  .post(
    authorize('admin', 'purchase'),
    [
      body('name').trim().notEmpty().withMessage('Name is required'),
      body('email').isEmail().withMessage('Valid email is required'),
      body('phone').trim().notEmpty().withMessage('Phone number is required'),
    ],
    validate,
    createSupplier,
  );

router
  .route('/:id')
  .get(getSupplier)
  .put(
    authorize('admin', 'purchase'),
    [
      body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
      body('email').optional().isEmail().withMessage('Valid email is required'),
    ],
    validate,
    updateSupplier,
  )
  .delete(authorize('admin'), deleteSupplier);

module.exports = router;