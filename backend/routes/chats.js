const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Chat = require('../models/Chat');
const Ride = require('../models/Ride');

// GET history
router.get('/:rideId', protect, async (req, res) => {
  const { rideId } = req.params;
  // authorize: requester must be ride driver (postedBy) or a passenger who booked this ride
  const ride = await Ride.findById(rideId);
  if (!ride) return res.status(404).json({ message: 'Ride not found' });
  const userId = req.user?._id?.toString() || req.userId;
  // NOTE: Quick allow for now (driver or any user) — tighten later by checking Booking exists
  // TODO: Ensure user is driver or has a booking for this ride
  const messages = await Chat.find({ ride: rideId })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('sender', 'fullName email');
  return res.json({ messages: messages.reverse() });
});

// POST message (REST fallback)
router.post('/:rideId', protect, async (req, res) => {
  const { rideId } = req.params;
  const { message } = req.body;
  if (!message || !message.trim()) return res.status(400).json({ message: 'Message required' });
  const ride = await Ride.findById(rideId);
  if (!ride) return res.status(404).json({ message: 'Ride not found' });
  const userId = req.user?._id?.toString() || req.userId;

  const chat = await Chat.create({ ride: rideId, sender: userId, message: message.trim() });
  const populated = await Chat.findById(chat._id).populate('sender', 'fullName email');
  // Later: also emit over socket from here if needed
  return res.status(201).json({ message: 'Sent', chat: populated });
});

module.exports = router;
