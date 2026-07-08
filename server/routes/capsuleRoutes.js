const express = require('express');
const router = express.Router();
const { 
  createCapsule, 
  getMyCapsules, 
  getPublicCapsules, 
  getCapsuleById, 
  lockCapsule,
  unlockCapsule,
  makePublic,
  makePrivate,
  deleteCapsule,
  likeCapsule,
  commentCapsule
} = require('../controllers/capsuleController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createCapsule);
router.get('/my-capsules', protect, getMyCapsules);
router.get('/public', getPublicCapsules);
router.get('/:id', protect, getCapsuleById);

// Status transition endpoints
router.patch('/:id/lock', protect, lockCapsule);
router.patch('/:id/unlock', protect, unlockCapsule);
router.patch('/:id/public', protect, makePublic);
router.patch('/:id/private', protect, makePrivate);

// Interaction endpoints
router.post('/:id/like', protect, likeCapsule);
router.post('/:id/comment', protect, commentCapsule);

router.delete('/:id', protect, deleteCapsule);

module.exports = router;
