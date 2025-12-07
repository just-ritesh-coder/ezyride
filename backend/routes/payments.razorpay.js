const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Razorpay = require("razorpay");
const { protect } = require("../middleware/authMiddleware");
const Booking = require("../models/Booking");
const Ride = require("../models/Ride");

// Validate Razorpay credentials
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn("⚠️  WARNING: Razorpay credentials not configured. Payment will fail.");
  console.warn("   RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? "✅ Set" : "❌ Missing");
  console.warn("   RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "✅ Set" : "❌ Missing");
} else {
  // Log credential info (masked for security)
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  console.log("🔑 Razorpay Credentials Loaded:");
  console.log("   Key ID:", keyId.substring(0, 12) + "..." + keyId.substring(keyId.length - 4));
  console.log("   Key ID Length:", keyId.length, "characters");
  console.log("   Key Secret Length:", keySecret.length, "characters");
  console.log("   Key Type:", keyId.startsWith("rzp_test_") ? "TEST" : keyId.startsWith("rzp_live_") ? "LIVE" : "UNKNOWN");
  
  // Check for common issues
  if (keyId.includes(" ") || keySecret.includes(" ")) {
    console.warn("⚠️  WARNING: Credentials may contain spaces - check your .env file");
  }
  if (keySecret.length < 20) {
    console.warn("⚠️  WARNING: Key Secret seems too short (should be ~32+ characters)");
  }
}

// Initialize Razorpay instance (will be undefined if credentials are missing)
let rz = null;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    // Trim whitespace from credentials (common .env file issue)
    const keyId = String(process.env.RAZORPAY_KEY_ID).trim();
    const keySecret = String(process.env.RAZORPAY_KEY_SECRET).trim();
    
    if (!keyId || !keySecret) {
      console.error("❌ Razorpay credentials are empty after trimming");
    } else {
      rz = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      console.log("✅ Razorpay instance initialized with test key");
    }
  } else {
    console.error("❌ Cannot initialize Razorpay - credentials missing");
  }
} catch (error) {
  console.error("❌ Error initializing Razorpay:", error.message);
}

// POST /api/payments/razorpay/order
router.post("/order", protect, async (req, res) => {
  try {
    console.log("📦 Razorpay order request received:", { 
      bookingId: req.body?.bookingId,
      userId: req.userId 
    });

    // Check Razorpay credentials
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("❌ Razorpay credentials missing");
      return res.status(500).json({ 
        message: "Razorpay not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables." 
      });
    }

    const { bookingId } = req.body || {};
    if (!bookingId) {
      console.error("❌ Missing bookingId in request");
      return res.status(400).json({ message: "bookingId required" });
    }

    console.log("🔍 Fetching booking:", bookingId);
    const booking = await Booking.findById(bookingId).populate("ride");
    if (!booking) {
      console.error("❌ Booking not found:", bookingId);
      return res.status(404).json({ message: "Booking not found" });
    }
    
    const ride = booking.ride;
    if (!ride) {
      console.error("❌ Ride not found for booking:", bookingId);
      return res.status(404).json({ message: "Ride not found" });
    }

    console.log("✅ Booking and ride found:", {
      bookingId: booking._id,
      rideId: ride._id,
      rideStatus: ride.status,
      pricePerSeat: ride.pricePerSeat,
      seatsBooked: booking.seatsBooked
    });

    // prefer after-completion; change condition if paying at booking time
    if (ride.status !== "completed") {
      console.warn("⚠️ Ride not completed:", ride.status);
      return res.status(400).json({ message: "Ride must be completed before payment" });
    }

    const amountPaise = Math.round((ride.pricePerSeat || 0) * (booking.seatsBooked || 1) * 100);
    console.log("💰 Amount calculation:", {
      pricePerSeat: ride.pricePerSeat,
      seatsBooked: booking.seatsBooked,
      amountPaise: amountPaise,
      amountRupees: amountPaise / 100
    });
    
    // Razorpay minimum amount is 1 INR (100 paise)
    if (amountPaise < 100) {
      console.error("❌ Amount too low:", amountPaise);
      return res.status(400).json({ 
        message: `Amount too low. Minimum payment is ₹1. Calculated amount: ₹${amountPaise / 100}` 
      });
    }

    const receipt = `rcpt_${booking._id}`;
    console.log("🔄 Creating Razorpay order...");
    
    // Use trimmed credentials
    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    console.log("🔑 Using Razorpay Key ID:", keyId?.substring(0, 15) + "...");
    console.log("🔑 Key ID starts with:", keyId?.substring(0, 9));

    if (!rz) {
      throw new Error("Razorpay instance not initialized. Check your environment variables.");
    }

    // Re-initialize with trimmed credentials if needed
    if (!keyId || !keySecret) {
      throw new Error("Razorpay credentials are empty after trimming. Check your .env file.");
    }

    const order = await rz.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes: {
        bookingId: booking._id.toString(),
        rideId: ride._id.toString(),
      },
    });

    console.log("✅ Razorpay order created:", order.id);

    booking.razorpayOrderId = order.id;
    await booking.save();

    console.log("✅ Booking updated with order ID");

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      bookingId: booking._id,
    });
  } catch (e) {
    console.error("❌ Razorpay order error:");
    console.error("Error message:", e.message);
    console.error("Error stack:", e.stack);
    if (e.error) {
      console.error("Razorpay error object:", JSON.stringify(e.error, null, 2));
    }
    if (e.response) {
      console.error("Razorpay response:", JSON.stringify(e.response, null, 2));
    }
    
    // Handle Razorpay authentication errors specifically
    if (e.error && e.error.code === "BAD_REQUEST_ERROR" && 
        e.error.description === "Authentication failed") {
      console.error("❌ Razorpay Authentication Failed!");
      console.error("   This usually means:");
      console.error("   1. Key ID and Key Secret don't match");
      console.error("   2. Credentials are from different accounts (test vs live)");
      console.error("   3. Credentials are incorrect or have been regenerated");
      console.error("   4. Key Secret might be incomplete");
      console.error("   Please verify your credentials at: https://dashboard.razorpay.com/app/keys");
      
      return res.status(500).json({ 
        message: "Razorpay authentication failed. Please verify your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file match your Razorpay dashboard.",
        error: "Authentication failed",
        help: "Check your credentials at https://dashboard.razorpay.com/app/keys"
      });
    }
    
    // Provide more detailed error messages
    let errorMessage = "Failed to create order";
    if (e.error) {
      errorMessage = e.error.description || e.error.error?.description || e.error.error?.message || errorMessage;
    } else if (e.message) {
      errorMessage = e.message;
    }
    
    return res.status(500).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? e.message : undefined,
      details: process.env.NODE_ENV === 'development' && e.error ? e.error : undefined
    });
  }
});

// POST /api/payments/razorpay/verify
router.post("/verify", protect, async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ 
        message: "Razorpay not configured. RAZORPAY_KEY_SECRET is missing." 
      });
    }

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
    return res.status(500).json({ 
      message: "Verification failed",
      error: process.env.NODE_ENV === 'development' ? e.message : undefined
    });
  }
});

module.exports = router;
