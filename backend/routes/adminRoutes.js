const express = require('express');
const { getPendingPandits, getAllPanditsAdmin, verifyPandit, rejectPandit, getStats, suspendPandit, getPanditByIdAdmin } = require('../controllers/adminController');
const { getAllUsers, toggleSuspend, getUserByIdAdmin, suspendUser, reactivateUser } = require('../controllers/userController');
const { getAllBookings, getBookingByIdAdmin } = require('../controllers/bookingController');
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
router.get('/users/:id', getUserByIdAdmin);
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/reactivate', reactivateUser);
router.get('/bookings', getAllBookings);
router.get('/bookings/:id', getBookingByIdAdmin);

module.exports = router;
