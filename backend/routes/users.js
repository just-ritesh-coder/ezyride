const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// @desc    Upload profile picture (must come before /me routes for proper matching)
// @route   POST /api/users/me/profile-picture
// @access  Private
router.post("/me/profile-picture", protect, async (req, res) => {
  try {
    console.log("📸 Profile picture upload request received");
    const { profilePicture } = req.body;
    
    // Allow null to remove profile picture
    if (profilePicture === null || profilePicture === undefined) {
      const updatedUser = await User.findByIdAndUpdate(
        req.userId,
        { $unset: { profilePicture: "" } },
        { new: true, runValidators: true, select: "_id fullName email phone vehicle preferences profilePicture createdAt" }
      );

      if (!updatedUser) return res.status(404).json({ message: "User not found" });

      return res.json({ user: updatedUser, message: "Profile picture removed successfully" });
    }
    
    // Validate base64 image format
    if (!profilePicture.startsWith('data:image/')) {
      return res.status(400).json({ message: "Invalid image format" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: { profilePicture } },
      { new: true, runValidators: true, select: "_id fullName email phone vehicle preferences profilePicture createdAt" }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    console.log("✅ Profile picture updated successfully");
    res.json({ user: updatedUser, message: "Profile picture updated successfully" });
  } catch (error) {
    console.error("❌ POST /me/profile-picture error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @desc    Get logged-in user profile
// @route   GET /api/users/me
// @access  Private
router.get("/me", protect, async (req, res) => {
  try {
    if (!req.user) return res.status(404).json({ message: "User not found" });

    const user = await User.findById(req.user._id).select("_id fullName email phone vehicle preferences profilePicture createdAt");
    res.json({ user });
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
    const { fullName, phone, vehicle, preferences, profilePicture } = req.body;

    const updatedFields = {};
    if (fullName !== undefined) updatedFields.fullName = fullName;
    if (phone !== undefined) updatedFields.phone = phone;
    if (vehicle !== undefined) updatedFields.vehicle = vehicle;
    if (preferences !== undefined) updatedFields.preferences = preferences;
    if (profilePicture !== undefined) updatedFields.profilePicture = profilePicture;

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: updatedFields },
      { new: true, runValidators: true, select: "_id fullName email phone vehicle preferences profilePicture createdAt" }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json({ user: updatedUser });
  } catch (error) {
    console.error("PATCH /me error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
