// models/Booking.js
const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    ride: { type: mongoose.Schema.Types.ObjectId, ref: "Ride", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seatsBooked: { type: Number, default: 1 },
    status: { type: String, default: "confirmed" }, // adjust to your flow
    bookingDate: { type: Date, default: Date.now },
    // OTP to start ride
    ride_start_code: { type: String },
    ride_start_code_used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);
