const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// @desc    Get logged-in user profile
// @route   GET /api/users/me
// @access  Private
router.get("/me", protect, async (req, res) => {
  try {
    if (!req.user) return res.status(404).json({ message: "User not found" });

    res.json({ user: req.user });
  } catch (error) {
    console.error("GET /me error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Update logged-in user profile
// @route   PATCH /api/users/me
// @access  Private
router.patch("/me", protect, async (req, res) => {
  try {
    const { fullName, phone, vehicle, preferences } = req.body;

    const updatedFields = {};
    if (fullName !== undefined) updatedFields.fullName = fullName;
    if (phone !== undefined) updatedFields.phone = phone;
    if (vehicle !== undefined) updatedFields.vehicle = vehicle;
    if (preferences !== undefined) updatedFields.preferences = preferences;

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: updatedFields },
      { new: true, runValidators: true, select: "_id fullName email phone vehicle preferences createdAt" }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json({ user: updatedUser });
  } catch (error) {
    console.error("PATCH /me error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
