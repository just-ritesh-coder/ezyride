const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema({
  from: { type: String, required: true, trim: true },
  to: { type: String, required: true, trim: true },
  date: { type: Date, required: true },

  seatsAvailable: { type: Number, required: true, min: 0 },
  pricePerSeat: { type: Number, required: true, min: 0 },

  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Optional convenience; maintain if needed in bookings logic
  passengerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  status: {
    type: String,
    enum: ['posted', 'ongoing', 'completed'],
    default: 'posted',
  },

  notes: { type: String }
}, { timestamps: true });

RideSchema.index({ from: 1 });
RideSchema.index({ to: 1 });
RideSchema.index({ date: 1 });
RideSchema.index({ status: 1 });

module.exports = mongoose.model('Ride', RideSchema);
