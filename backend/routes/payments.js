const express = require('express');
const router = express.Router();
const { getConfig, confirmManual } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/config', getConfig);
router.post('/confirm-manual', protect, upload.single('screenshot'), confirmManual);

module.exports = router;
