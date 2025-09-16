const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');
const { protect } = require('../middleware/authMiddleware');

const ALLOWED_STATUSES = ['posted', 'ongoing', 'completed'];

router.put('/:rideId/status', protect, async (req, res) => {
  const { rideId } = req.params;
  const { status } = req.body;

  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Only driver who posted the ride can update
    if (ride.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this ride' });
    }

    // Optional strict sequencing:
    // if (status === 'ongoing' && ride.status !== 'posted') {
    //   return res.status(400).json({ message: 'Can only start a posted ride' });
    // }
    // if (status === 'completed' && ride.status !== 'ongoing') {
    //   return res.status(400).json({ message: 'Can only complete an ongoing ride' });
    // }

    ride.status = status;
    await ride.save();

    // TODO: emit websocket event if using realtime
    return res.json({ message: 'Ride status updated successfully', ride });
  } catch (error) {
    console.error('Error updating ride status:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
