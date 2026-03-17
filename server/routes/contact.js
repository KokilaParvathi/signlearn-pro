const express = require('express');
const router  = express.Router();
const Contact = require('../models/Contact');
const { protect, authorize } = require('../middleware/auth');

// POST /api/contact — public, submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const contact = await Contact.create({ name, email, subject, message });
    res.status(201).json({
      success: true,
      message: 'Your message has been received. We will get back to you within 24 hours.',
      id: contact._id
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message. Please try again.' });
  }
});

// GET /api/contact — admin only, view all messages
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/contact/:id — admin only, update status
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;