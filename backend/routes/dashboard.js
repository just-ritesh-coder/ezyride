const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Import your Mongoose models (make sure these paths are correct)
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

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

// Helper function to format relative time for activities
function timeSince(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `${interval} hour${interval > 1 ? 's' : ''} ago`;
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return `${interval} minute${interval > 1 ? 's' : ''} ago`;
  return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
}

// GET /api/dashboard
router.get('/', verifyToken, async (req, res) => {
  const userId = req.userId;

  try {
    // Fetch counts from MongoDB
    const ridesPostedCount = await Ride.countDocuments({ postedBy: userId });
    const upcomingBookingsCount = await Booking.countDocuments({
      user: userId,
      date: { $gte: new Date() },
    });
    const reviewsReceivedCount = await Review.countDocuments({ reviewee: userId });

    // Fetch recent rides for activities - last 5
    const recentRides = await Ride.find({ postedBy: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('from to date createdAt');

    // Map to activity descriptions
    const recentActivities = recentRides.map((ride) => ({
      id: ride._id,
      description: `You posted a ride from ${ride.from} to ${ride.to}`,
      time: timeSince(ride.createdAt),
    }));

    // Respond with stats and activities
    res.json({
      stats: [
        { id: 1, title: 'Rides Posted', count: ridesPostedCount },
        { id: 2, title: 'Upcoming Bookings', count: upcomingBookingsCount },
        { id: 3, title: 'Reviews Received', count: reviewsReceivedCount },
      ],
      activities: recentActivities,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
