const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

// Get messages for a room
router.get('/:room', protect, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room })
      .populate('sender', 'name avatar role')
      .populate('replies.sender', 'name role')
      .sort('createdAt')
      .limit(200);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Post a message
router.post('/', protect, async (req, res) => {
  try {
    const { content, room, type, flaggedQuiz, flaggedQuestion } = req.body;

    // Only teachers/admins can post in announcements
    if (room === 'announcements' && !['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only teachers can post announcements' });
    }

    const message = await Message.create({
      content,
      room,
      sender: req.user._id,
      type: type || (room === 'announcements' ? 'announcement' : 'text'),
      flaggedQuiz,
      flaggedQuestion
    });
    await message.populate('sender', 'name avatar role');
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reply to a message
router.post('/:id/reply', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    message.replies.push({
      sender: req.user._id,
      content: req.body.content
    });
    await message.save();
    await message.populate('sender', 'name avatar role');
    await message.populate('replies.sender', 'name role');
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark doubt/flag as resolved (teacher only)
router.put('/:id/resolve', protect, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isResolved: true },
      { new: true }
    ).populate('sender', 'name role').populate('replies.sender', 'name role');
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;