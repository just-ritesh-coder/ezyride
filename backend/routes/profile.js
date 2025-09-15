const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Helper function to format the user profile response
const formatUserProfile = (user) => ({
  name: user.fullName,
  email: user.email,
  phone: user.phone,
  vehicle: user.vehicle,
  preferences: user.preferences,
});

// GET /api/profile - Get user profile
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(formatUserProfile(user));
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/profile - Update user profile
router.put('/', protect, async (req, res) => {
  const { name, email, phone, vehicle, preferences } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update only provided fields
    if (name !== undefined) user.fullName = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (vehicle !== undefined) user.vehicle = vehicle;
    if (preferences !== undefined) user.preferences = preferences;

    await user.save();

    res.json(formatUserProfile(user));
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
