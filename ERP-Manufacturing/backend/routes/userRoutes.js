const express = require('express');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateUserRegistration } = require('../middleware/validationMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(authorize('admin', 'manager'), getUsers)
  .post(authorize('admin'), validateUserRegistration, createUser);

router.route('/:id')
  .get(authorize('admin', 'manager'), getUserById)
  .put(authorize('admin'), updateUser)
  .delete(authorize('admin'), deleteUser);

router.put('/:id/activate', authorize('admin'), activateUser);
router.put('/:id/deactivate', authorize('admin'), deactivateUser);

module.exports = router;