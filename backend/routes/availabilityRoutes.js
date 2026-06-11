const express = require('express');
const {
  setAvailability, updateAvailability, deleteAvailability,
  getPanditAvailability, getMyAvailability,
} = require('../controllers/availabilityController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/me', protect, requireRole('pandit'), getMyAvailability);
router.get('/pandit/:panditId', getPanditAvailability);
router.post('/', protect, requireRole('pandit'), setAvailability);
router.put('/:id', protect, requireRole('pandit'), updateAvailability);
router.delete('/:id', protect, requireRole('pandit'), deleteAvailability);

module.exports = router;
