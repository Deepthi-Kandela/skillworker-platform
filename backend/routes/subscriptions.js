const express = require('express');
const router = express.Router();
const { getPlans, subscribe, getMySubscription } = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

router.get('/plans', getPlans);
router.use(protect);
router.get('/my', getMySubscription);
router.post('/subscribe', subscribe);

module.exports = router;
