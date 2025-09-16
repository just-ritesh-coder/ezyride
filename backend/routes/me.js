const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');
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

module.exports = router;
