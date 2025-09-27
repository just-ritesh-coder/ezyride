// models/Booking.js
const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    ride: { type: mongoose.Schema.Types.ObjectId, ref: "Ride", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seatsBooked: { type: Number, default: 1 },
    status: { type: String, default: "confirmed" }, // booking state
    bookingDate: { type: Date, default: Date.now },

    // OTP to start ride
    ride_start_code: { type: String },
    ride_start_code_used: { type: Boolean, default: false },

    // Payments (Razorpay)
    paymentStatus: {
      type: String,
      enum: ["pending", "succeeded", "failed", "refunded"],
      default: "pending",
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);
