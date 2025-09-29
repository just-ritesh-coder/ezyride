const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Only active rides (posted, ongoing)
router.get('/users/me/rides/active', protect, async (req, res) => {
  try {
    const active = await Ride.find({
      postedBy: req.user._id,
      status: { $in: ['posted', 'ongoing'] },
    }).sort({ date: -1 });
    return res.json({ rides: active });
  } catch (e) {
    console.error('Fetch active rides error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Only completed rides
router.get('/users/me/rides/completed', protect, async (req, res) => {
  try {
    const completed = await Ride.find({
      postedBy: req.user._id,
      status: 'completed',
    }).sort({ date: -1 });
    return res.json({ rides: completed });
  } catch (e) {
    console.error('Fetch completed rides error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Saved searches
router.get('/users/me/saved-searches', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('savedSearches');
    return res.json({ savedSearches: user?.savedSearches || [] });
  } catch (e) {
    console.error('Fetch saved searches error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/users/me/saved-searches', protect, async (req, res) => {
  try {
    const { origin, destination } = req.body || {};
    if (!origin || !destination) return res.status(400).json({ message: 'origin and destination required' });
    const user = await User.findById(req.user._id).select('savedSearches');
    user.savedSearches.unshift({ origin, destination });
    user.savedSearches = user.savedSearches.slice(0, 20);
    await user.save();
    return res.json({ savedSearches: user.savedSearches });
  } catch (e) {
    console.error('Add saved search error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/users/me/saved-searches', protect, async (req, res) => {
  try {
    const { origin, destination } = req.body || {};
    const user = await User.findById(req.user._id).select('savedSearches');
    user.savedSearches = (user.savedSearches || []).filter(
      s => !(s.origin === origin && s.destination === destination)
    );
    await user.save();
    return res.json({ savedSearches: user.savedSearches });
  } catch (e) {
    console.error('Delete saved search error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Safety & payment settings
router.get('/users/me/settings', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('safetyPaymentSettings');
    return res.json({ settings: user?.safetyPaymentSettings || {} });
  } catch (e) {
    console.error('Fetch settings error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.put('/users/me/settings', protect, async (req, res) => {
  try {
    const { shareLocation, requireOTP, defaultPaymentMethod } = req.body || {};
    const user = await User.findById(req.user._id).select('safetyPaymentSettings');
    user.safetyPaymentSettings = {
      shareLocation: !!shareLocation,
      requireOTP: !!requireOTP,
      defaultPaymentMethod: defaultPaymentMethod || 'razorpay',
    };
    await user.save();
    return res.json({ settings: user.safetyPaymentSettings });
  } catch (e) {
    console.error('Update settings error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
