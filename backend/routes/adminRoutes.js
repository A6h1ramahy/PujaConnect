const express = require('express');
const { getPendingPandits, getAllPanditsAdmin, verifyPandit, rejectPandit, getStats, suspendPandit, getPanditByIdAdmin, deletePanditAdmin } = require('../controllers/adminController');
const { getAllUsers, toggleSuspend, getUserByIdAdmin, suspendUser, reactivateUser, deleteUserAdmin } = require('../controllers/userController');
const { getAllBookings, getBookingByIdAdmin } = require('../controllers/bookingController');
const { getAllAdmins, createAdmin, suspendAdmin, reactivateAdmin, deleteAdmin } = require('../controllers/adminManagementController');
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
router.delete('/pandits/:id', deletePanditAdmin);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserByIdAdmin);
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/reactivate', reactivateUser);
router.delete('/users/:id', deleteUserAdmin);
router.get('/bookings', getAllBookings);
router.get('/bookings/:id', getBookingByIdAdmin);

// Admin Management
router.get('/admins', getAllAdmins);
router.post('/admins', createAdmin);
router.put('/admins/:id/suspend', suspendAdmin);
router.put('/admins/:id/reactivate', reactivateAdmin);
router.delete('/admins/:id', deleteAdmin);

module.exports = router;
