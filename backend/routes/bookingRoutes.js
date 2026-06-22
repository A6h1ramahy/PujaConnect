const express = require('express');
const { bookingRules } = require('../utils/validators');
const {
  createBooking, getMyBookings, getPanditBookings,
  acceptBooking, rejectBooking, completeBooking, cancelBooking, getAllBookings,
  getBookingByIdUser, getBookingMessages, sendBookingMessage,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/',              protect, requireRole('user'),            bookingRules, createBooking);
router.get('/my',             protect, requireRole('user'),            getMyBookings);
router.get('/pandit',         protect, requireRole('pandit'),          getPanditBookings);
router.put('/:id/accept',     protect, requireRole('pandit'),          acceptBooking);
router.put('/:id/reject',     protect, requireRole('pandit'),          rejectBooking);
router.put('/:id/complete',   protect, requireRole('pandit', 'admin'), completeBooking);
router.put('/:id/cancel',     protect, requireRole('user'),            cancelBooking);
router.get('/:id/messages',   protect, requireRole('user', 'pandit', 'admin'), getBookingMessages);
router.post('/:id/messages',  protect, requireRole('user', 'pandit'),          sendBookingMessage);
router.get('/:id',            protect, requireRole('user', 'pandit'),  getBookingByIdUser);
router.get('/',               protect, requireRole('admin'),           getAllBookings);

module.exports = router;
