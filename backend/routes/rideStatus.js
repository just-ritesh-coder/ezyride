const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');
const { protect } = require('../middleware/authMiddleware');

const ALLOWED_STATUSES = ['posted', 'ongoing', 'completed'];

router.put('/:rideId/status', protect, async (req, res) => {
  const { rideId } = req.params;
  const { status } = req.body;

  // Validate status value
  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid ride status' });
  }

  try {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Authorization: only the driver of this ride can update its status
    if (ride.driverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update ride status' });
    }

    ride.status = status;
    await ride.save();

    res.json({ message: 'Ride status updated successfully', ride });
  } catch (error) {
    console.error('Error updating ride status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
