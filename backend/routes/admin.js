const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Ride = require('../models/Ride');
const { protect, adminProtect } = require('../middleware/authMiddleware');

/**
 * GET /api/admin/users
 * Fetch all users for admin user management
 */
router.get('/users', protect, adminProtect, async (req, res) => {
    try {
        const users = await User.find()
            .select('fullName email phone role kyc vehicleType createdAt profilePicture')
            .sort({ createdAt: -1 });

        res.json({ users });
    } catch (e) {
        console.error('Fetch all users error:', e);
        res.status(500).json({ message: 'Server error fetching users' });
    }
});

/**
 * GET /api/admin/rides
 * Fetch all rides for admin ride management
 */
router.get('/rides', protect, adminProtect, async (req, res) => {
    try {
        const rides = await Ride.find()
            .populate('postedBy', 'fullName email')
            .sort({ createdAt: -1 });

        res.json({ rides });
    } catch (e) {
        console.error('Fetch all rides error:', e);
        res.status(500).json({ message: 'Server error fetching rides' });
    }
});

/**
 * GET /api/admin/kyc/pending
 * Fetch all users with pending KYC
 */
router.get('/kyc/pending', protect, adminProtect, async (req, res) => {
    try {
        const pendingUsers = await User.find({ 'kyc.status': { $in: ['pending', 'rejected'] } })
            .select('fullName email phone kyc createdAt')
            .sort({ 'kyc.submittedAt': -1 });
            
        res.json({ users: pendingUsers });
    } catch (e) {
        console.error('Fetch pending KYC error:', e);
        res.status(500).json({ message: 'Server error fetching pending KYC applications' });
    }
});

/**
 * PUT /api/admin/kyc/:id
 * Update KYC status for a specific user
 */
router.put('/kyc/:id', protect, adminProtect, async (req, res) => {
    try {
        const { status } = req.body; // 'verified' or 'rejected'

        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.kyc.status = status;
        await user.save();

        res.json({ message: `User KYC ${status} successfully`, user: { _id: user._id, kyc: user.kyc } });
    } catch (e) {
        console.error('Update KYC status error:', e);
        res.status(500).json({ message: 'Server error updating KYC status' });
    }
});

module.exports = router;
