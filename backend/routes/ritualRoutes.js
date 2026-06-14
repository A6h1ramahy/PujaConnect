const express = require('express');
const { createRitual, updateRitual, deleteRitual, getRituals, getRitualBySlug, getAllRituals, uploadRitualImage } = require('../controllers/ritualController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', getRituals);
router.get('/all', protect, requireRole('admin'), getAllRituals);
router.post('/upload', protect, requireRole('admin'), upload.single('image'), uploadRitualImage);
router.get('/:slug', getRitualBySlug);
router.post('/', protect, requireRole('admin'), createRitual);
router.put('/:id', protect, requireRole('admin'), updateRitual);
router.delete('/:id', protect, requireRole('admin'), deleteRitual);

module.exports = router;
