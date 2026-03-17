const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/lessons', require('./routes/lessons'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/users', require('./routes/users'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/contact',    require('./routes/contact'));

io.on('connection', (socket) => {
  // ── CHAT ──
  socket.on('join-room', (roomId) => socket.join(roomId));

  socket.on('send-message', (data) => {
    io.to(data.room).emit('receive-message', data);
  });

  socket.on('send-reply', (data) => {
    // data: { room, message } — full updated message with replies
    io.to(data.room).emit('receive-reply', data.message);
  });

  socket.on('message-resolved', (data) => {
    io.to(data.room).emit('receive-resolved', data.message);
  });

  // ── QUIZ BATTLE ──
  socket.on('quiz-battle-join', (data) => {
    socket.join(data.battleId);
    io.to(data.battleId).emit('player-joined', {
      playerId: data.playerId,
      playerName: data.playerName
    });
  });

  socket.on('battle-start', (data) => {
    io.to(data.battleId).emit('battle-started', { quiz: data.quiz });
  });

  socket.on('battle-next-question', (data) => {
    io.to(data.battleId).emit('next-question', { questionIndex: data.questionIndex });
  });

  socket.on('battle-end', (data) => {
    io.to(data.battleId).emit('battle-ended');
  });

  socket.on('player-score', (data) => {
    io.to(data.battleId).emit('score-update', {
      playerId: data.playerId,
      playerName: data.playerName,
      totalScore: data.totalScore
    });
  });

  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/signlearn-pro';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));