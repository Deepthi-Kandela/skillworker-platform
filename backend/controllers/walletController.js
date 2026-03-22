const Wallet = require('../models/Wallet');

const getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) wallet = await Wallet.create({ user: req.user._id });
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const topUp = async (req, res) => {
  try {
    const { amount, reference } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) wallet = await Wallet.create({ user: req.user._id });

    wallet.balance += Number(amount);
    wallet.transactions.push({ type: 'credit', amount, description: 'Wallet Top-up', reference });
    await wallet.save();
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const withdraw = async (req, res) => {
  try {
    const { amount } = req.body;
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    wallet.balance -= Number(amount);
    wallet.transactions.push({ type: 'debit', amount, description: 'Withdrawal Request' });
    await wallet.save();
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) return res.json([]);
    const sorted = [...wallet.transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getWallet, topUp, withdraw, getTransactions };
