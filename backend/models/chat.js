const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  // optional: booking: { type: ObjectId, ref: 'Booking' },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true, trim: true },
}, { timestamps: true });

ChatSchema.index({ ride: 1, createdAt: -1 });

module.exports = mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
