const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  vehicle: { type: String },
  preferences: { type: String },

  // Client features persisted to backend
  savedSearches: [
    {
      origin: { type: String, trim: true },
      destination: { type: String, trim: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  safetyPaymentSettings: {
    shareLocation: { type: Boolean, default: true },
    requireOTP: { type: Boolean, default: true },
    defaultPaymentMethod: { type: String, default: 'razorpay' },
  },

  // Add these for password reset
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password during login
userSchema.methods.matchPassword = function(password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
