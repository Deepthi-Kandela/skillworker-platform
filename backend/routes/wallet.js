const express = require('express');
const router = express.Router();
const { getWallet, topUp, withdraw, getTransactions } = require('../controllers/walletController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getWallet);
router.post('/topup', topUp);
router.post('/withdraw', withdraw);
router.get('/transactions', getTransactions);

module.exports = router;
