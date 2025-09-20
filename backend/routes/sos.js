// routes/sos.js
require('dotenv').config();
const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const { protect } = require('../middleware/authMiddleware');
const SOS = require('../models/SOS');

// GET /api/sos/me
router.get('/me', protect, async (req, res) => {
  try {
    const doc = await SOS.findOne({ user: req.user._id });
    res.json({
      sos: doc || { contacts: [], message: "I need help. This is my live location." }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/sos/me
router.put('/me', protect, async (req, res) => {
  try {
    const { contacts = [], message } = req.body || {};
    if (!Array.isArray(contacts)) return res.status(400).json({ message: "contacts must be an array" });

    const trimmed = contacts
      .filter(c => c && c.name && c.phone)
      .slice(0, 3)
      .map(c => ({
        name: String(c.name).trim(),
        phone: String(c.phone).trim().replace(/^0+/, ''), // remove leading 0 if any
        relation: (c.relation || "").trim()
      }));

    const doc = await SOS.findOneAndUpdate(
      { user: req.user._id },
      { user: req.user._id, contacts: trimmed, message: message || "I need help. This is my live location." },
      { upsert: true, new: true }
    );

    res.json({ sos: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/sos/trigger
router.post('/trigger', protect, async (req, res) => {
  try {
    const { lat, lng } = req.body || {};
    const doc = await SOS.findOne({ user: req.user._id });

    if (!doc || doc.contacts.length === 0)
      return res.status(400).json({ message: "No emergency contacts configured" });

    const mapsLink = lat && lng ? `https://maps.google.com/?q=${lat},${lng}` : null;
    const results = [];

    for (const contact of doc.contacts) {
      // Ensure WhatsApp sandbox friendly number format
      let phone = contact.phone;
      if (!phone.startsWith('+')) phone = '+91' + phone; // default +91 if missing

      try {
        const message = await client.messages.create({
          from: 'whatsapp:' + process.env.TWILIO_FROM,
          to: 'whatsapp:' + phone,
          body: `${doc.message}${mapsLink ? `\nLocation: ${mapsLink}` : ''}`
        });
        results.push({ contact: phone, sid: message.sid });
      } catch (err) {
        console.error('Twilio error for', phone, err.message);
        results.push({ contact: phone, error: err.message });
      }
    }

    console.log("SOS TRIGGERED:", {
      user: req.user._id.toString(),
      contacts: doc.contacts,
      message: doc.message,
      location: { lat, lng },
      results
    });

    res.json({ ok: true, notified: results.length, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
