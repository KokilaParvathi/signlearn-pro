const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'image', 'announcement', 'doubt', 'flag'], default: 'text' },
  imageUrl: String,
  room: { type: String, required: true },
  replies: [replySchema],
  isResolved: { type: Boolean, default: false },
  flaggedQuiz: String,
  flaggedQuestion: String,
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);