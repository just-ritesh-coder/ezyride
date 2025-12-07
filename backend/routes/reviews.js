// backend/routes/reviews.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Ride = require('../models/Ride');

/**
 * POST /api/reviews
 * Create a review for a driver (from a completed booking)
 */
router.post('/', protect, async (req, res) => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    const { bookingId, rating, comment } = req.body;

    if (!userId) return res.status(401).json({ message: 'Not authorized' });
    if (!bookingId) return res.status(400).json({ message: 'bookingId is required' });
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId)
      .populate('ride', 'postedBy status')
      .populate('user', '_id');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'You can only review rides you booked' });
    }

    // Check if ride is completed
    if (booking.ride.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed rides' });
    }

    const driverId = booking.ride.postedBy?.toString();
    if (!driverId) return res.status(400).json({ message: 'Driver not found' });

    // Check if user already reviewed this booking
    const existingReview = await Review.findOne({ 
      reviewer: userId, 
      reviewee: driverId,
      bookingId: bookingId 
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this ride' });
    }

    // Create review
    const review = await Review.create({
      reviewer: userId,
      reviewee: driverId,
      rating: Number(rating),
      comment: comment ? String(comment).trim() : '',
      bookingId: bookingId
    });

    const populated = await Review.findById(review._id)
      .populate('reviewer', 'fullName')
      .populate('reviewee', 'fullName');

    return res.status(201).json({ 
      message: 'Review submitted successfully', 
      review: populated 
    });
  } catch (error) {
    console.error('Create review error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * GET /api/reviews/user/:userId
 * Get all reviews for a user (as driver)
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ reviewee: userId })
      .populate('reviewer', 'fullName profilePicture')
      .sort({ createdAt: -1 });

    return res.json({ reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * GET /api/reviews/booking/:bookingId
 * Check if a review exists for a booking
 */
router.get('/booking/:bookingId', protect, async (req, res) => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate('ride', 'postedBy');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const driverId = booking.ride.postedBy?.toString();
    const review = await Review.findOne({ 
      reviewer: userId, 
      reviewee: driverId,
      bookingId: bookingId 
    });

    return res.json({ hasReview: !!review, review: review || null });
  } catch (error) {
    console.error('Check review error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

