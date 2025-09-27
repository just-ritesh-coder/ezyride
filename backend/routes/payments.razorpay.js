const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Razorpay = require("razorpay");
const { protect } = require("../middleware/authMiddleware");
const Booking = require("../models/Booking");
const Ride = require("../models/Ride");

const rz = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payments/razorpay/order
router.post("/order", protect, async (req, res) => {
  try {
    const { bookingId } = req.body || {};
    if (!bookingId) return res.status(400).json({ message: "bookingId required" });

    const booking = await Booking.findById(bookingId).populate("ride");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    const ride = booking.ride;
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    // prefer after-completion; change condition if paying at booking time
    if (ride.status !== "completed") {
      return res.status(400).json({ message: "Ride must be completed before payment" });
    }

    const amountPaise = Math.round((ride.pricePerSeat || 0) * (booking.seatsBooked || 1) * 100);
    const receipt = `rcpt_${booking._id}`;

    const order = await rz.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes: {
        bookingId: booking._id.toString(),
        rideId: ride._id.toString(),
      },
    });

    booking.razorpayOrderId = order.id;
    await booking.save();

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      bookingId: booking._id,
    });
  } catch (e) {
    console.error("Razorpay order error:", e);
    return res.status(500).json({ message: "Failed to create order" });
  }
});

// POST /api/payments/razorpay/verify
router.post("/verify", protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    shasum.update(razorpay_order_id + "|" + razorpay_payment_id);
    const digest = shasum.digest("hex");

    if (digest !== razorpay_signature) {
      return res.status(400).json({ message: "Signature verification failed" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ message: "Order mismatch" });
    }

    booking.paymentStatus = "succeeded";
    booking.razorpayPaymentId = razorpay_payment_id;
    await booking.save();

    return res.json({ ok: true });
  } catch (e) {
    console.error("Razorpay verify error:", e);
    return res.status(500).json({ message: "Verification failed" });
  }
});

module.exports = router;
