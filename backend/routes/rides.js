// backend/routes/rides.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');

/**
 * POST /api/rides
 * Create a new ride
 */
router.post('/', protect, async (req, res) => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    if (!userId) return res.status(401).json({ message: 'Not authorized' });

    const { from, to, seatsAvailable, pricePerSeat, notes = '', date } = req.body;

    if (!from || !to) return res.status(400).json({ message: 'from and to are required' });
    if (!date) return res.status(400).json({ message: 'date is required' });

    const seats = Number(seatsAvailable);
    const price = Number(pricePerSeat);
    if (!Number.isInteger(seats) || seats < 1) {
      return res.status(400).json({ message: 'seatsAvailable must be a positive integer' });
    }
    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({ message: 'pricePerSeat must be >= 0' });
    }

    const when = new Date(date);
    if (isNaN(when.getTime())) {
      return res.status(400).json({ message: 'date must be a valid ISO datetime' });
    }

    const ride = await Ride.create({
      from: String(from).trim(),
      to: String(to).trim(),
      date: when,
      seatsAvailable: seats,
      pricePerSeat: price,
      notes,
      status: 'posted',
      postedBy: userId,
      createdAt: new Date(),
    });

    const populated = await Ride.findById(ride._id).populate('postedBy', 'fullName');
    return res.status(201).json({ message: 'Ride created', ride: populated });
  } catch (e) {
    console.error('Create ride error:', e);
    return res.status(500).json({ message: 'Server error', error: e.message });
  }
});

/**
 * GET /api/rides/search
 * Search available rides
 */
router.get('/search', async (req, res) => {
  try {
    const { from, to, date } = req.query;
    if (!from || !to) return res.status(400).json({ message: 'from and to are required' });

    const normFrom = String(from).trim().replace(/\s+/g, ' ');
    const normTo = String(to).trim().replace(/\s+/g, ' ');
    const fromRegex = new RegExp(normFrom, 'i');
    const toRegex = new RegExp(normTo, 'i');

    const filter = {
      from: { $regex: fromRegex },
      to: { $regex: toRegex },
      status: { $in: ['posted', 'ongoing'] },
      seatsAvailable: { $gt: 0 },
    };

    if (date) {
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filter.date = { $gte: start, $lte: end };
      }
    }

    const rides = await Ride.find(filter)
      .sort({ date: 1 })
      .populate('postedBy', 'fullName');

    return res.json({ rides });
  } catch (e) {
    console.error('Search rides error:', e);
    return res.status(500).json({ message: 'Server error', error: e.message });
  }
});

/**
 * Internal helper: verify OTP and return booking or null
 */
async function verifyOtpForRide(rideId, code) {
  if (!code) return null;
  const booking = await Booking.findOne({
    ride: rideId,
    status: 'confirmed',
    ride_start_code: code,
    ride_start_code_used: { $ne: true },
  }).select('_id ride_start_code_used');
  return booking || null;
}

/**
 * POST /api/rides/:rideId/start
 * Start a ride (driver only). If code provided, verify it first.
 */
router.post('/:rideId/start', protect, async (req, res) => {
  try {
    const { rideId } = req.params;
    const { code } = req.body || {};
    const userId = req.user?._id?.toString() || req.userId;

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });

    if (ride.postedBy.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to start this ride' });
    }
    if (ride.status !== 'posted') {
      return res.status(400).json({ message: 'Ride already started or completed' });
    }

    if (code) {
      const booking = await verifyOtpForRide(rideId, code);
      if (!booking) {
        return res.status(400).json({ message: 'Invalid or already used code' });
      }
      booking.ride_start_code_used = true;
      await booking.save();
    }

    ride.status = 'ongoing';
    ride.startedAt = new Date();
    await ride.save();

    return res.json({ message: 'Ride started', ride });
  } catch (e) {
    console.error('Start ride error:', e);
    return res.status(500).json({ message: 'Server error', error: e.message });
  }
});

/**
 * POST /api/rides/:rideId/start/verify
 * Optional alias that requires code (to match previous frontend calls)
 */
router.post('/:rideId/start/verify', protect, async (req, res) => {
  try {
    const { rideId } = req.params;
    const { code } = req.body || {};
    const userId = req.user?._id?.toString() || req.userId;

    if (!code) return res.status(400).json({ message: 'Code required' });

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });

    if (ride.postedBy.toString() !== userId) {
      return res.status(403).json({ message: 'Only the driver can start the ride' });
    }
    if (ride.status !== 'posted') {
      return res.status(400).json({ message: 'Ride already started or completed' });
    }

    const booking = await verifyOtpForRide(rideId, code);
    if (!booking) {
      return res.status(400).json({ message: 'Invalid or already used code' });
    }

    booking.ride_start_code_used = true;
    await booking.save();

    ride.status = 'ongoing';
    ride.startedAt = new Date();
    await ride.save();

    return res.json({ ok: true, rideId: ride._id, startedAt: ride.startedAt });
  } catch (e) {
    console.error('Start verify error:', e);
    return res.status(500).json({ message: 'Failed to verify code' });
  }
});

/**
 * POST /api/rides/:rideId/complete
 * Complete a ride (driver only)
 */
router.post('/:rideId/complete', protect, async (req, res) => {
  try {
    const { rideId } = req.params;
    const userId = req.user?._id?.toString() || req.userId;

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });

    if (ride.postedBy.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to complete this ride' });
    }
    if (ride.status === 'completed') {
      return res.status(400).json({ message: 'Ride already completed' });
    }

    ride.status = 'completed';
    ride.completedAt = new Date();
    await ride.save();

    return res.json({ message: 'Ride completed', ride });
  } catch (e) {
    console.error('Complete ride error:', e);
    return res.status(500).json({ message: 'Server error', error: e.message });
  }
});

module.exports = router;
