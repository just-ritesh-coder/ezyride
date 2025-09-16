const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  // Combine date and time on frontend into one ISO Date
  date: { type: Date, required: true },

  seatsAvailable: { type: Number, required: true, min: 1 },
  pricePerSeat: { type: Number, required: true, min: 0 },

  // Driver who posted the ride (single-login model: any user can be driver or passenger)
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Users who booked seats
  passengerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Ride status lifecycle
  status: {
    type: String,
    enum: ['posted', 'ongoing', 'completed'],
    default: 'posted',
  },

  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Ride', RideSchema);
