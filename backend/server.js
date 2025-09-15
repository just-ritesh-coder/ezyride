const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const rideStatusRoutes = require('./routes/rideStatus');
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Base route
app.get("/", (req, res) => {
  res.send("Ride Sharing API is running");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/rides", require("./routes/rides"));
app.use("/api/bookings", require("./routes/bookings"));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/rides', rideStatusRoutes);
 // <-- Add this line

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
