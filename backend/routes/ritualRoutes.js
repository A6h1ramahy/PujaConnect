const express = require('express');
const { createRitual, updateRitual, deleteRitual, getRituals, getAllRituals } = require('../controllers/ritualController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', getRituals);
router.get('/all', protect, requireRole('admin'), getAllRituals);
router.post('/', protect, requireRole('admin'), createRitual);
router.put('/:id', protect, requireRole('admin'), updateRitual);
router.delete('/:id', protect, requireRole('admin'), deleteRitual);

module.exports = router;
