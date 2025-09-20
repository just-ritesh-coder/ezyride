const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // reuse your auth middleware
const SOS = require('../models/SOS');

// Get my SOS settings
router.get('/me', protect, async (req, res) => {
  const doc = await SOS.findOne({ user: req.user._id });
  res.json({ sos: doc || { contacts: [], message: "I need help. This is my live location." } });
});

// Update my SOS settings
router.put('/me', protect, async (req, res) => {
  const { contacts = [], message } = req.body || {};
  if (!Array.isArray(contacts)) return res.status(400).json({ message: "contacts must be an array" });
  const trimmed = contacts
    .filter(c => c && c.name && c.phone)
    .slice(0, 3)
    .map(c => ({ name: String(c.name).trim(), phone: String(c.phone).trim(), relation: (c.relation || "").trim() }));
  const doc = await SOS.findOneAndUpdate(
    { user: req.user._id },
    { user: req.user._id, contacts: trimmed, message: message || "I need help. This is my live location." },
    { upsert: true, new: true }
  );
  res.json({ sos: doc });
});

// Trigger SOS alert (MVP: log to server; swap with SMS/Email later)
router.post('/trigger', protect, async (req, res) => {
  const { lat, lng } = req.body || {};
  const doc = await SOS.findOne({ user: req.user._id });
  if (!doc || doc.contacts.length === 0) {
    return res.status(400).json({ message: "No emergency contacts configured" });
  }
  const maps = lat && lng ? `https://maps.google.com/?q=${lat},${lng}` : null;
  // TODO integrate provider (Twilio/SendGrid/WhatsApp)
  console.log("SOS TRIGGERED", {
    user: req.user._id.toString(),
    contacts: doc.contacts,
    message: doc.message,
    location: { lat, lng },
    maps,
  });
  res.json({ ok: true, notified: doc.contacts.length });
});

module.exports = router;
