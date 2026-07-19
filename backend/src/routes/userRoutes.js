const express = require('express');
const { body } = require('express-validator');
const { getUsers, getUser, updateUserRole, toggleUserActive } = require('../controllers/userController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.route('/').get(getUsers);

router.route('/:id').get(getUser);

router.put(
  '/:id/role',
  [
    body('role')
      .isIn(['admin', 'sales', 'purchase', 'inventory'])
      .withMessage('Invalid role'),
  ],
  validate,
  updateUserRole,
);

router.put('/:id/toggle-active', toggleUserActive);

module.exports = router;