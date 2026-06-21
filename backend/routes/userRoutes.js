const express = require('express');
const { getProfile, updateProfile, getAllUsers, toggleSuspend, changePassword, deleteAccountSelf } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.delete('/delete-account', protect, deleteAccountSelf);
router.get('/', protect, requireRole('admin'), getAllUsers);
router.put('/:id/suspend', protect, requireRole('admin'), toggleSuspend);

module.exports = router;
