const express = require('express');
const { panditProfileRules } = require('../utils/validators');
const { createOrUpdateProfile, getAllPandits, getPanditById, getMyPanditProfile } = require('../controllers/panditController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public / Optional Auth routes
router.get('/',    optionalProtect, getAllPandits);
router.get('/me',  protect, requireRole('pandit'), getMyPanditProfile);
router.get('/:id', optionalProtect, getPanditById);

// Pandit-only — with optional photo upload + profile validation
router.post('/profile', protect, requireRole('pandit'), upload.single('photo'), panditProfileRules, createOrUpdateProfile);
router.put('/profile',  protect, requireRole('pandit'), upload.single('photo'), panditProfileRules, createOrUpdateProfile);

module.exports = router;
