const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// POST /api/bookings - Book a ride
router.post('/', verifyToken, async (req, res) => {
  const { rideId, seats } = req.body;

  if (!rideId || !seats || seats < 1) {
    return res.status(400).json({ message: 'Invalid booking data' });
  }

  try {
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });

    if (ride.seatsAvailable < seats) {
      return res.status(400).json({ message: 'Not enough available seats' });
    }

    // Deduct booked seats
    ride.seatsAvailable -= seats;
    await ride.save();

    // Create booking record
    const booking = new Booking({
      ride: rideId,
      user: req.userId,
      seatsBooked: seats,
      bookedAt: new Date(),
    });

    await booking.save();

    res.status(201).json({ message: 'Ride booked successfully', booking });
  } catch (err) {
    console.error('Error booking ride:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/bookings/mybookings - Get user's bookings
router.get('/mybookings', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.userId }).populate('ride').exec();
    res.json({ bookings });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
