const express = require('express');
const { getPendingPandits, getAllPanditsAdmin, verifyPandit, rejectPandit, getStats, suspendPandit, getPanditByIdAdmin } = require('../controllers/adminController');
const { getAllUsers, toggleSuspend } = require('../controllers/userController');
const { getAllBookings } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// All admin routes are protected
router.use(protect, requireRole('admin'));

router.get('/stats', getStats);
router.get('/pandits/pending', getPendingPandits);
router.get('/pandits', getAllPanditsAdmin);
router.get('/pandits/:id', getPanditByIdAdmin);
router.put('/pandits/:id/verify', verifyPandit);
router.put('/pandits/:id/reject', rejectPandit);
router.put('/pandits/:id/suspend', suspendPandit);
router.get('/users', getAllUsers);
router.put('/users/:id/suspend', toggleSuspend);
router.get('/bookings', getAllBookings);

module.exports = router;
