const express = require('express');
const { body } = require('express-validator');
const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getCustomers)
  .post(
    authorize('admin', 'sales'),
    [
      body('name').trim().notEmpty().withMessage('Name is required'),
      body('email').isEmail().withMessage('Valid email is required'),
      body('phone').trim().notEmpty().withMessage('Phone number is required'),
    ],
    validate,
    createCustomer,
  );

router
  .route('/:id')
  .get(getCustomer)
  .put(
    authorize('admin', 'sales'),
    [
      body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
      body('email').optional().isEmail().withMessage('Valid email is required'),
    ],
    validate,
    updateCustomer,
  )
  .delete(authorize('admin'), deleteCustomer);

module.exports = router;