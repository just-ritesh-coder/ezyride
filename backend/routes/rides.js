const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');
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

// POST /api/rides - Create a new ride
router.post('/', verifyToken, async (req, res) => {
  const { origin, destination, date, time, seats, price, notes } = req.body;

  if (!origin || !destination || !date || !time || !seats || !price) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const ride = new Ride({
      from: origin,
      to: destination,
      date: new Date(`${date}T${time}`),
      seatsAvailable: seats,
      pricePerSeat: price,
      notes,
      postedBy: req.userId,
    });

    await ride.save();

    res.status(201).json({ message: 'Ride posted successfully', ride });
  } catch (err) {
    console.error('Error posting ride:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/rides/search - Search rides by origin and destination
router.get('/search', async (req, res) => {
  const { origin, destination } = req.query;

  if (!origin || !destination) {
    return res.status(400).json({ message: 'Please provide origin and destination for search.' });
  }

  try {
    const regexOrigin = new RegExp(origin, 'i'); // case-insensitive search
    const regexDestination = new RegExp(destination, 'i');

    const rides = await Ride.find({
      from: { $regex: regexOrigin },
      to: { $regex: regexDestination },
    });

    res.json({ rides });
  } catch (err) {
    console.error('Error searching rides:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
