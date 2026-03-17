const express = require('express');
const router = express.Router();
const { Quiz, QuizResult } = require('../models/Quiz');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

router.get('/', protect, async (req, res) => {
  try {
    const quizzes = await Quiz.find(
      req.user.role === 'teacher' ? { teacher: req.user._id } : {}
    ).populate('teacher', 'name').populate('lesson', 'title');
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('lesson', 'title');
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const totalPoints = req.body.questions?.reduce((sum, q) => sum + (q.points || 5), 0) || 0;
    const quiz = await Quiz.create({ ...req.body, teacher: req.user._id, totalPoints });
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quiz deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/submit', protect, async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    let score = 0;
    let pointsEarned = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) {
        score++;
        pointsEarned += q.points;
      }
    });
    const result = await QuizResult.create({
      quiz: req.params.id, student: req.user._id,
      answers, score, pointsEarned, timeTaken
    });
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { completedQuizzes: req.params.id },
      $inc: { points: pointsEarned }
    });
    res.json({ score, total: quiz.questions.length, pointsEarned, result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/results', protect, async (req, res) => {
  try {
    const results = await QuizResult.find({ quiz: req.params.id })
      .populate('student', 'name avatar')
      .sort('-pointsEarned');
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
