// backend/routes/bookings.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Booking = require("../models/Booking");
const Ride = require("../models/Ride");

/**
 * POST /api/bookings
 * Create a booking (with OTP)
 */
router.post("/", protect, async (req, res) => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    const { rideId, seats = 1 } = req.body;

    if (!userId) return res.status(401).json({ message: "Not authorized" });
    if (!rideId || !mongoose.Types.ObjectId.isValid(rideId) || !Number.isInteger(seats) || seats < 1) {
      return res.status(400).json({ message: "Invalid rideId or seats" });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (ride.status === "completed") return res.status(400).json({ message: "Cannot book a completed ride" });

    const available = ride.seatsAvailable ?? 0;
    if (available < seats) return res.status(400).json({ message: "Not enough seats available" });
    if (ride.postedBy?.toString && ride.postedBy.toString() === userId) {
      return res.status(400).json({ message: "Cannot book your own ride" });
    }

    // Generate 6-digit OTP
    const startCode = (Math.floor(100000 + Math.random() * 900000)).toString();

    const booking = await Booking.create({
      ride: ride._id,
      user: userId,
      seatsBooked: seats,
      bookingDate: new Date(),
      ride_start_code: startCode,
      ride_start_code_used: false
    });

    // Deduct seats
    ride.seatsAvailable = available - seats;
    await ride.save();

    const populated = await Booking.findById(booking._id)
      .populate("ride")
      .populate("user", "fullName email");

    return res.status(201).json({
      message: "Ride booked successfully",
      booking: {
        _id: populated._id,
        ride: populated.ride,
        seatsBooked: populated.seatsBooked,
        user: populated.user,
        bookingDate: populated.bookingDate
        // Do NOT return OTP here for security
      }
    });
  } catch (e) {
    console.error("Create booking error:", e);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/bookings/mybookings
 * List my bookings with OTP for rider view
 */
router.get("/mybookings", protect, async (req, res) => {
  try {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    res.set("Surrogate-Control", "no-store");

    const userId = req.user?._id?.toString() || req.userId;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    const bookings = await Booking.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("ride")
      .populate("user", "fullName email");

    // Explicit shape so frontend can read b.ride_start_code
    const data = bookings.map(b => ({
      _id: b._id,
      ride: b.ride,
      user: b.user,
      seatsBooked: b.seatsBooked,
      status: b.status,
      bookingDate: b.bookingDate,
      createdAt: b.createdAt,
      ride_start_code: b.ride_start_code,
      ride_start_code_used: b.ride_start_code_used,
    }));

    return res.json({ bookings: data });
  } catch (e) {
    console.error("Fetch my bookings error:", e);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * PATCH /api/bookings/:bookingId
 * Modify seats in a booking
 */
router.patch("/:bookingId", protect, async (req, res) => {
  const { bookingId } = req.params;
  const { seats } = req.body;

  if (!seats || !Number.isInteger(seats) || seats < 1) {
    return res.status(400).json({ message: "Invalid seats" });
  }
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    return res.status(400).json({ message: "Invalid bookingId format" });
  }

  try {
    const booking = await Booking.findById(bookingId).populate("ride");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.user.toString() !== (req.user?._id?.toString() || req.userId)) {
      return res.status(403).json({ message: "Not authorized to modify this booking" });
    }

    const ride = booking.ride;
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (ride.status === "completed") {
      return res.status(400).json({ message: "Cannot modify a completed ride" });
    }

    const prev = booking.seatsBooked ?? 0;
    const delta = seats - prev;
    const available = ride.seatsAvailable ?? 0;
    if (delta > 0 && available < delta) {
      return res.status(400).json({ message: "Not enough seats available" });
    }

    ride.seatsAvailable = available - delta;
    booking.seatsBooked = seats;

    await ride.save();
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate("ride")
      .populate("user", "fullName email");

    return res.json({ message: "Booking updated", booking: populated });
  } catch (e) {
    console.error("Modify booking error:", e);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/bookings/:bookingId
 * Cancel booking
 */
router.delete("/:bookingId", protect, async (req, res) => {
  const { bookingId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    return res.status(400).json({ message: "Invalid bookingId format" });
  }

  try {
    const booking = await Booking.findById(bookingId).populate("ride");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.user.toString() !== (req.user?._id?.toString() || req.userId)) {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    const ride = booking.ride;
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    const seats = booking.seatsBooked ?? 0;
    ride.seatsAvailable = (ride.seatsAvailable ?? 0) + seats;

    await ride.save();
    await booking.deleteOne();

    return res.json({ message: "Booking cancelled" });
  } catch (e) {
    console.error("Cancel booking error:", e);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
