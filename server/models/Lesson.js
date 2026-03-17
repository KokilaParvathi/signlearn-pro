const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  type: { type: String, enum: ['video', 'image', 'animation', 'text'], required: true },
  url: String,
  text: String,
  caption: String,
  order: Number
});

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  subject: String,
  thumbnail: String,
  contents: [contentSchema],
  videoUrl: String,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
  pointsReward: { type: Number, default: 10 },
  language: { type: String, default: 'en' },
  tags: [String],
  isPublished: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);
