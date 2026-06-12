const express = require('express');
const { createRitual, updateRitual, deleteRitual, getRituals, getRitualBySlug, getAllRituals } = require('../controllers/ritualController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', getRituals);
router.get('/all', protect, requireRole('admin'), getAllRituals);
router.get('/:slug', getRitualBySlug);
router.post('/', protect, requireRole('admin'), createRitual);
router.put('/:id', protect, requireRole('admin'), updateRitual);
router.delete('/:id', protect, requireRole('admin'), deleteRitual);

module.exports = router;
