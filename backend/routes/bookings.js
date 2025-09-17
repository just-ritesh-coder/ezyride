const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Booking = require("../models/Booking");
const Ride = require("../models/Ride");

// CREATE booking
router.post("/", protect, async (req, res) => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    const { rideId, seats = 1 } = req.body;

    console.log("POST /api/bookings", { userId, body: req.body });

    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (
      !rideId ||
      !mongoose.Types.ObjectId.isValid(rideId) ||
      !Number.isInteger(seats) ||
      seats < 1
    ) {
      return res.status(400).json({ message: "Invalid rideId or seats" });
    }

    const ride = await Ride.findById(rideId);
    console.log("Ride lookup:", !!ride, ride?._id?.toString());

    if (!ride) return res.status(404).json({ message: "Ride not found" });

    if (ride.status === "completed") {
      return res.status(400).json({ message: "Cannot book a completed ride" });
    }

    const available = ride.seatsAvailable ?? 0;
    if (available < seats) {
      return res.status(400).json({ message: "Not enough seats available" });
    }

    if (ride.postedBy?.toString && ride.postedBy.toString() === userId) {
      return res.status(400).json({ message: "Cannot book your own ride" });
    }

    const booking = await Booking.create({
      ride: ride._id,
      user: userId,
      seatsBooked: seats,
      bookingDate: new Date(),
    });

    // Deduct seats only; DO NOT change status here
    ride.seatsAvailable = available - seats;
    await ride.save();

    const populated = await Booking.findById(booking._id)
      .populate("ride")
      .populate("user", "fullName email");

    return res.status(201).json({ message: "Booked", booking: populated });
  } catch (e) {
    console.error("Create booking error:", e.message, e.stack);
    if (e.name === "ValidationError") {
      return res.status(400).json({ message: "Validation failed", errors: e.errors });
    }
    return res.status(500).json({ message: e.message || "Server error" });
  }
});

// LIST my bookings
router.get("/mybookings", protect, async (req, res) => {
  try {
    // Optional: disable caching for fresh lists
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

    return res.json({ bookings });
  } catch (e) {
    console.error("Fetch my bookings error:", e.message, e.stack);
    return res.status(500).json({ message: e.message || "Server error" });
  }
});

// UPDATE seats in a booking
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

    if (
      booking.user.toString() !==
      (req.user?._id?.toString() || req.userId)
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to modify this booking" });
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

    // Adjust seats only; leave status to driver actions
    ride.seatsAvailable = available - delta;
    booking.seatsBooked = seats;

    await ride.save();
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate("ride")
      .populate("user", "fullName email");

    return res.json({ message: "Booking updated", booking: populated });
  } catch (e) {
    console.error("Modify booking error:", e.message, e.stack);
    return res.status(500).json({ message: e.message || "Server error" });
  }
});

// CANCEL booking
router.delete("/:bookingId", protect, async (req, res) => {
  const { bookingId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    return res.status(400).json({ message: "Invalid bookingId format" });
  }

  try {
    const booking = await Booking.findById(bookingId).populate("ride");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (
      booking.user.toString() !==
      (req.user?._id?.toString() || req.userId)
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this booking" });
    }

    const ride = booking.ride;
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    const seats = booking.seatsBooked ?? 0;
    ride.seatsAvailable = (ride.seatsAvailable ?? 0) + seats;

    // DO NOT change status here; driver controls lifecycle
    await ride.save();
    await booking.deleteOne();

    return res.json({ message: "Booking cancelled" });
  } catch (e) {
    console.error("Cancel booking error:", e.message, e.stack);
    return res.status(500).json({ message: e.message || "Server error" });
  }
});

module.exports = router;
