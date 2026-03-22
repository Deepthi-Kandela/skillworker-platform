const Subscription = require('../models/Subscription');
const Worker = require('../models/Worker');

const PLANS = {
  basic:   { price: 0,    days: 30,  features: ['Listed in search', 'Basic profile'] },
  premium: { price: 499,  days: 30,  features: ['Top search results', 'Verified badge', 'Priority support'] },
  pro:     { price: 999,  days: 30,  features: ['#1 in search', 'Featured on home', 'Analytics', 'Priority support'] },
};

const getPlans = (req, res) => res.json(PLANS);

const subscribe = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ message: 'Invalid plan' });

    const planData = PLANS[plan];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + planData.days);

    // Deactivate old subscription
    await Subscription.updateMany({ worker: req.user._id, isActive: true }, { isActive: false });

    const subscription = await Subscription.create({
      worker: req.user._id,
      plan,
      price: planData.price,
      endDate,
      features: planData.features,
    });

    // Update worker isPremium
    await Worker.findOneAndUpdate(
      { user: req.user._id },
      { isPremium: plan !== 'basic', premiumExpiry: endDate }
    );

    res.status(201).json(subscription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMySubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ worker: req.user._id, isActive: true }).sort({ createdAt: -1 });
    res.json(sub || { plan: 'basic', isActive: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getPlans, subscribe, getMySubscription };
