const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  questionImage: String,
  options: [{ text: String, image: String }],
  correctAnswer: { type: Number, required: true },
  explanation: String,
  points: { type: Number, default: 5 },
  type: { type: String, enum: ['mcq', 'image-match', 'drag-drop'], default: 'mcq' }
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questions: [questionSchema],
  timeLimit: { type: Number, default: 30 },
  isBattleEnabled: { type: Boolean, default: true },
  totalPoints: { type: Number, default: 0 }
}, { timestamps: true });

const quizResultSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [Number],
  score: Number,
  pointsEarned: Number,
  timeTaken: Number,
  completedAt: { type: Date, default: Date.now }
});

module.exports = {
  Quiz: mongoose.model('Quiz', quizSchema),
  QuizResult: mongoose.model('QuizResult', quizResultSchema)
};
