const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  relation: { type: String, trim: true },
});

const SOSSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  contacts: { type: [ContactSchema], default: [] },
  message: { type: String, default: "I need help. This is my live location." },
}, { timestamps: true });

SOSSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('SOS', SOSSchema);
