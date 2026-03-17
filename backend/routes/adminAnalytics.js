const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const { protect, adminProtect } = require('../middleware/authMiddleware');

// Helper: relative time string
function timeSince(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
}

/**
 * GET /api/admin/analytics
 * Fetch company-wide analytics + recent activity for the admin dashboard
 */
router.get('/', protect, adminProtect, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalRides = await Ride.countDocuments();
        const totalBookings = await Booking.countDocuments();
        const pendingKYC = await User.countDocuments({ 'kyc.status': { $in: ['pending', 'rejected'] } });

        // Recent activity: last 5 rides + last 5 bookings, merged and sorted
        const recentRides = await Ride.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('postedBy', 'fullName')
            .select('from to status createdAt postedBy');

        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'fullName')
            .populate('ride', 'from to')
            .select('ride user seatsBooked status createdAt');

        // Build activity feed
        const activities = [];

        for (const ride of recentRides) {
            const driverName = ride.postedBy?.fullName || 'Unknown';
            activities.push({
                id: ride._id,
                type: 'ride',
                description: `<strong>${driverName}</strong> posted a ride from ${ride.from} to ${ride.to}.`,
                time: timeSince(ride.createdAt),
                timestamp: ride.createdAt,
            });
        }

        for (const booking of recentBookings) {
            const passengerName = booking.user?.fullName || 'Unknown';
            const from = booking.ride?.from || '?';
            const to = booking.ride?.to || '?';
            activities.push({
                id: booking._id,
                type: 'booking',
                description: `<strong>${passengerName}</strong> booked ${booking.seatsBooked} seat(s) on ride ${from} → ${to}.`,
                time: timeSince(booking.createdAt),
                timestamp: booking.createdAt,
            });
        }

        // Sort by newest first
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json({
            metrics: {
                totalUsers,
                totalRides,
                totalBookings,
                pendingKYC
            },
            recentActivity: activities.slice(0, 8)
        });
    } catch (e) {
        console.error('Fetch admin analytics error:', e);
        res.status(500).json({ message: 'Server error fetching analytics' });
    }
});

module.exports = router;
