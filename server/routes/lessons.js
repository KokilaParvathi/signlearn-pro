const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Lesson = require('../models/Lesson');
const { protect, authorize } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'server/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      // Students see published lessons they are enrolled in OR all published lessons
      query = { isPublished: true };
    } else if (req.user.role === 'teacher') {
      query = { teacher: req.user._id };
    }
    // admin sees all lessons (empty query)
    const lessons = await Lesson.find(query).populate('teacher', 'name').sort('-createdAt');
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('teacher', 'name').populate('quiz');
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    lesson.viewCount += 1;
    await lesson.save();
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const lesson = await Lesson.create({ ...req.body, teacher: req.user._id });
    res.status(201).json(lesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lesson deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/add-students', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { studentIds } = req.body;
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { students: { $each: studentIds } } },
      { new: true }
    );
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/complete', protect, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { completedLessons: req.params.id },
      $inc: { points: lesson.pointsReward }
    });
    res.json({ message: 'Lesson completed', pointsEarned: lesson.pointsReward });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;