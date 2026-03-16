const express = require('express');
const router = express.Router();
const { createWorkerProfile, updateWorkerProfile, searchWorkers, getWorkerById, getNearbyWorkers, getRecommendedWorkers } = require('../controllers/workerController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/search', searchWorkers);
router.get('/nearby', getNearbyWorkers);
router.get('/recommended', getRecommendedWorkers);
router.get('/:id', getWorkerById);
router.post('/', protect, createWorkerProfile);
router.put('/', protect, authorize('worker'), upload.fields([{ name: 'portfolio', maxCount: 5 }, { name: 'idProof', maxCount: 1 }]), updateWorkerProfile);

module.exports = router;
