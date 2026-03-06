const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Storage config (Local for MVP)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // e.g. user-123-aadhaarFirst-timestamp.jpg
        const ext = path.extname(file.originalname);
        cb(null, `user-${req.user._id}-${file.fieldname}-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only images are allowed'));
    }
});

// Upload fields: aadhaarFront, aadhaarBack, selfie
const uploadFields = upload.fields([
    { name: 'aadhaarFront', maxCount: 1 },
    { name: 'aadhaarBack', maxCount: 1 },
    { name: 'selfie', maxCount: 1 }
]);

/**
 * POST /api/kyc/upload
 * Upload KYC documents
 */
router.post('/upload', protect, async (req, res) => {
    // Check if already verified
    if (req.user.kyc && req.user.kyc.status === 'verified') {
        return res.status(400).json({ message: 'User is already verified' });
    }

    uploadFields(req, res, async (err) => {
        if (err) return res.status(400).json({ message: err.message });

        try {
            const files = req.files || {};
            const updates = {};

            if (files.aadhaarFront) updates['kyc.documents.aadhaarFront'] = files.aadhaarFront[0].path;
            if (files.aadhaarBack) updates['kyc.documents.aadhaarBack'] = files.aadhaarBack[0].path;
            if (files.selfie) updates['kyc.documents.selfie'] = files.selfie[0].path;

            updates['kyc.status'] = 'pending';
            updates['kyc.submittedAt'] = new Date();

            const user = await User.findByIdAndUpdate(
                req.user._id,
                { $set: updates },
                { new: true }
            ).select('-password');

            // Trigger Face Match Verification
            if (files.aadhaarFront && files.selfie) {
                try {
                    // Import dynamic to ensure models load on first use
                    const { compareFaces } = require('../utils/faceMatch');
                    const result = await compareFaces(files.aadhaarFront[0].path, files.selfie[0].path);

                    const fs = require('fs');
                    fs.writeFileSync('kyc_result.log', JSON.stringify({
                        user: user._id,
                        time: new Date(),
                        result
                    }, null, 2));

                    console.log(`Face Match Result for user ${user._id}:`, result);

                    let newStatus = 'pending';
                    if (result.match) {
                        newStatus = 'verified';
                        updates['kyc.matchScore'] = result.score;
                    } else if (result.error) {
                        console.warn("Face match error:", result.error);
                        // Keep pending, maybe flag error
                    } else {
                        // Low score
                        newStatus = 'rejected'; // Or keep pending for manual review?
                        // For this MVP user wants "option came for document verify", implying auto-verify if possible.
                        // Let's set to 'rejected' if clearly not a match, or 'manual_review' if we had that status.
                        // Plan said 'rejected' or 'pending'. Let's stick to 'pending' if score is low but not 0?
                        // No, plan said > 90% verified.
                        // If result.match is false (dist > 0.5), it's mismatched.
                        // Let's set 'rejected' for now so user sees feedback.
                        newStatus = 'rejected';
                        updates['kyc.matchScore'] = result.score;
                    }

                    updates['kyc.status'] = newStatus;

                    // Update user again with result
                    const finalUser = await User.findByIdAndUpdate(
                        req.user._id,
                        { $set: updates },
                        { new: true }
                    ).select('-password');

                    return res.json({
                        message: newStatus === 'verified' ? 'Documents verified successfully' : 'Verification failed/pending',
                        kyc: finalUser.kyc,
                        result
                    });

                } catch (verErr) {
                    console.error("Face verification failed:", verErr);
                    // Don't fail the upload, just keep pending
                    return res.json({ message: 'Documents uploaded, verification pending', kyc: user.kyc });
                }
            }

            res.json({ message: 'Documents uploaded successfully', kyc: user.kyc });
        } catch (e) {
            console.error('KYC upload error:', e);
            res.status(500).json({ message: 'Server error' });
        }
    });
});

/**
 * GET /api/kyc/status
 */
router.get('/status', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('kyc');
        res.json({ kyc: user.kyc });
    } catch (e) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
