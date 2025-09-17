const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Ride = require('../models/Ride');

/**
 * POST /api/rides
 * Create a new ride (driver posts a ride)
 * Expected body:
 * {
 *   from: string,
 *   to: string,
 *   seatsAvailable: number (>=1),
 *   pricePerSeat: number (>=0),
 *   notes?: string,
 *   date: ISO string
 * }
 */
router.post('/', protect, async (req, res) => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    if (!userId) return res.status(401).json({ message: 'Not authorized' });

    const {
      from,
      to,
      seatsAvailable,
      pricePerSeat,
      notes = '',
      date,
    } = req.body;

    // Basic validations
    if (!from || !to) {
      return res.status(400).json({ message: 'from and to are required' });
    }
    if (!date) {
      return res.status(400).json({ message: 'date is required' });
    }

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

    // Optional: block past postings (allow a small grace period if you want)
    // if (when.getTime() < Date.now() - 10 * 60 * 1000) {
    //   return res.status(400).json({ message: 'date must be in the future' });
    // }

    const ride = await Ride.create({
      from: from.trim(),
      to: to.trim(),
      date: when,
      seatsAvailable: seats,
      pricePerSeat: price,
      notes,
      status: 'posted',
      postedBy: userId,
      createdAt: new Date(),
    });

    const populated = await Ride.findById(ride._id).populate('postedBy', 'fullName email');
    return res.status(201).json({ message: 'Ride created', ride: populated });
  } catch (e) {
    console.error('Create ride error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/rides/search?from=...&to=...&date=YYYY-MM-DD (optional)
 * Search available rides by origin/destination and optional same-day date window.
 */
router.get('/search', async (req, res) => {
  try {
    const { from, to, date } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: 'from and to are required' });
    }

    // Normalize and build regex for case-insensitive contains search
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
      // Same-day window in UTC; adjust if your dates are saved in local time
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filter.date = { $gte: start, $lte: end };
      }
    }

    const rides = await Ride.find(filter)
      .sort({ date: 1 })
      .populate('postedBy', 'fullName email');

    return res.json({ rides });
  } catch (e) {
    console.error('Search rides error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
