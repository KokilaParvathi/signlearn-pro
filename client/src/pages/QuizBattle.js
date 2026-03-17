import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import './QuizBattle.css';

export default function QuizBattle() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [battleId, setBattleId] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [phase, setPhase] = useState('lobby'); // lobby | waiting | playing | finished
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [timer, setTimer] = useState(30);
  const [scores, setScores] = useState({});
  const [showCorrect, setShowCorrect] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const quizRef = useRef(null); // always current quiz even inside callbacks

  useEffect(() => {
    axios.get('/api/quizzes').then(r => setQuizzes(r.data.filter(q => q.isBattleEnabled)));

    const socket = io(process.env.REACT_APP_SERVER_URL || window.location.origin);
    socketRef.current = socket;

    // Someone joined this room
    socket.on('player-joined', (data) => {
      setPlayers(prev => {
        if (prev.find(p => p.id === data.playerId)) return prev;
        return [...prev, { id: data.playerId, name: data.playerName }];
      });
    });

    // Creator broadcast start + quiz data to all joiners
    socket.on('battle-started', (data) => {
      // Set quiz from socket data (important for joiners who don't have it)
      quizRef.current = data.quiz;
      setSelectedQuiz(data.quiz);
      setCurrentQ(0);
      setSelected(null);
      setScores({});
      setShowCorrect(false);
      setTimer(data.quiz.timeLimit || 30);
      setPhase('playing');
    });

    // Next question broadcast
    socket.on('next-question', (data) => {
      setCurrentQ(data.questionIndex);
      setSelected(null);
      setShowCorrect(false);
      setTimer(quizRef.current?.timeLimit || 30);
    });

    // Battle ended broadcast
    socket.on('battle-ended', () => {
      setPhase('finished');
      clearInterval(timerRef.current);
    });

    // Score updates from all players
    socket.on('score-update', (data) => {
      setScores(prev => ({ ...prev, [data.playerId]: data.totalScore }));
    });

    return () => socket.disconnect();
  }, []);

  // Keep quizRef in sync
  useEffect(() => {
    if (selectedQuiz) quizRef.current = selectedQuiz;
  }, [selectedQuiz]);

  const createBattle = () => {
    if (!selectedQuiz) return alert('Please select a quiz first!');
    const id = Math.random().toString(36).slice(2, 8).toUpperCase();
    setBattleId(id);
    setIsCreator(true);
    socketRef.current.emit('quiz-battle-join', {
      battleId: id,
      playerId: user._id,
      playerName: user.name
    });
    setPlayers([{ id: user._id, name: user.name }]);
    setPhase('waiting');
  };

  const joinBattle = () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return alert('Enter a battle code!');
    setBattleId(code);
    setIsCreator(false);
    socketRef.current.emit('quiz-battle-join', {
      battleId: code,
      playerId: user._id,
      playerName: user.name
    });
    setPlayers([{ id: user._id, name: user.name }]);
    setPhase('waiting');
  };

  const startBattle = () => {
    if (!selectedQuiz) return;
    // Broadcast quiz data + start signal to everyone in the room
    socketRef.current.emit('battle-start', {
      battleId,
      quiz: selectedQuiz
    });
  };

  const goToNext = useCallback(() => {
    const quiz = quizRef.current;
    if (!quiz) return;
    const nextIndex = currentQ + 1;
    if (nextIndex >= quiz.questions.length) {
      socketRef.current.emit('battle-end', { battleId });
      setPhase('finished');
      clearInterval(timerRef.current);
    } else {
      socketRef.current.emit('battle-next-question', {
        battleId,
        questionIndex: nextIndex
      });
      setCurrentQ(nextIndex);
      setSelected(null);
      setShowCorrect(false);
      setTimer(quiz.timeLimit || 30);
    }
  }, [currentQ, battleId]);

  // Timer for playing phase
  useEffect(() => {
    if (phase !== 'playing') return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setShowCorrect(true);
          setTimeout(() => {
            if (isCreator) goToNext();
          }, 1500);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, currentQ, isCreator, goToNext]);

  const handleAnswer = (i) => {
    if (selected !== null || showCorrect) return;
    setSelected(i);
    clearInterval(timerRef.current);

    const q = quizRef.current?.questions[currentQ];
    const pts = i === q?.correctAnswer ? (q?.points || 5) : 0;
    const newTotal = (scores[user._id] || 0) + pts;

    // Update local score
    setScores(prev => ({ ...prev, [user._id]: newTotal }));

    // Broadcast score to others
    socketRef.current.emit('player-score', {
      battleId,
      playerId: user._id,
      playerName: user.name,
      totalScore: newTotal
    });

    setShowCorrect(true);

    // Creator advances after delay
    if (isCreator) {
      setTimeout(() => goToNext(), 1800);
    }
  };

  const resetBattle = () => {
    setPhase('lobby');
    setScores({});
    setCurrentQ(0);
    setSelected(null);
    setShowCorrect(false);
    setBattleId('');
    setJoinCode('');
    setPlayers([]);
    setSelectedQuiz(null);
    setIsCreator(false);
    clearInterval(timerRef.current);
  };

  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const q = selectedQuiz?.questions[currentQ];
  const hasImages = q?.options?.some(o => o.image);

  return (
    <div className="battle-page">
      <div className="page-header">
        <h1>⚔️ Quiz Battle</h1>
        <p>Compete with classmates in real-time!</p>
      </div>

      {/* ── LOBBY ── */}
      {phase === 'lobby' && (
        <div className="battle-lobby">
          <div className="lobby-card">
            <h2>🎮 Create a Battle</h2>
            <p style={{ color: 'var(--text2)', marginBottom: 16 }}>Pick a quiz, create a room and share the code</p>

            {quizzes.length === 0 ? (
              <div className="empty-state" style={{ padding: 24 }}>
                <div className="icon">🎯</div>
                <h3>No battle quizzes yet</h3>
                <p>Ask your teacher to enable Quiz Battle on a quiz</p>
              </div>
            ) : (
              <div className="quiz-select-list">
                {quizzes.map(q => (
                  <div key={q._id}
                    className={`quiz-select-item ${selectedQuiz?._id === q._id ? 'selected' : ''}`}
                    onClick={() => setSelectedQuiz(q)}>
                    <span>🎯</span>
                    <div>
                      <div className="qsi-title">{q.title}</div>
                      <div className="qsi-sub">{q.questions?.length} questions · {q.timeLimit}s each</div>
                    </div>
                    {selectedQuiz?._id === q._id && <span className="check">✓</span>}
                  </div>
                ))}
              </div>
            )}

            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16, padding: 14 }}
              onClick={createBattle} disabled={!selectedQuiz}>
              🚀 Create Battle Room
            </button>
          </div>

          <div className="lobby-card">
            <h2>🔗 Join a Battle</h2>
            <p style={{ color: 'var(--text2)', marginBottom: 20 }}>Enter the code your classmate shared</p>
            <input
              type="text"
              value={joinCode}
              placeholder="e.g. AB12CD"
              style={{ textTransform: 'uppercase', letterSpacing: 6, textAlign: 'center', fontWeight: 800, fontSize: 22 }}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
            <button className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 14, padding: 14 }}
              onClick={joinBattle} disabled={!joinCode.trim()}>
              🎮 Join Battle
            </button>
          </div>
        </div>
      )}

      {/* ── WAITING ROOM ── */}
      {phase === 'waiting' && (
        <div className="waiting-room">
          <div className="waiting-card">
            <div className="battle-code">
              <span className="code-label">Battle Code</span>
              <div className="code-display">{battleId}</div>
              <p>Share this code with your classmates!</p>
            </div>

            <div className="players-waiting">
              <h3>👥 Players Joined ({players.length})</h3>
              {players.map(p => (
                <div key={p.id} className="player-waiting">
                  <div className="pw-avatar">{p.name?.[0]?.toUpperCase()}</div>
                  <span style={{ fontWeight: 700 }}>{p.name}</span>
                  {p.id === user._id && <span className="badge badge-primary">You</span>}
                </div>
              ))}
            </div>

            {isCreator ? (
              <div>
                <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 12, textAlign: 'center' }}>
                  You are the host. Start when everyone has joined.
                </p>
                <button className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: 16, fontSize: 18 }}
                  onClick={startBattle}>
                  🚀 Start Battle!
                </button>
              </div>
            ) : (
              <div className="waiting-for-host">
                <div className="waiting-spinner" />
                <p>Waiting for host to start the battle...</p>
              </div>
            )}

            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
              onClick={resetBattle}>
              ← Leave Room
            </button>
          </div>
        </div>
      )}

      {/* ── PLAYING ── */}
      {phase === 'playing' && selectedQuiz && q && (
        <div className="battle-playing">

          {/* Scoreboard */}
          <div className="battle-scoreboard">
            {players.map(p => (
              <div key={p.id} className={`player-score-card ${p.id === user._id ? 'me' : ''}`}>
                <div className="ps-avatar">{p.name?.[0]?.toUpperCase()}</div>
                <div>
                  <div className="ps-name">{p.id === user._id ? 'You' : p.name}</div>
                  <div className="ps-pts">⭐ {scores[p.id] || 0} pts</div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress + Timer */}
          <div className="battle-progress-row">
            <span className="q-counter">Q{currentQ + 1}/{selectedQuiz.questions.length}</span>
            <div className={`battle-timer-pill ${timer <= 5 ? 'urgent' : ''}`}>{timer}s</div>
          </div>

          <div className="battle-progress-bar">
            <div className="battle-progress-fill"
              style={{ width: `${((currentQ) / selectedQuiz.questions.length) * 100}%` }} />
          </div>

          {/* Question */}
          <div className="question-card">
            {q.questionImage && (
              <div className="question-image">
                <img src={q.questionImage} alt="question" onError={e => e.target.style.display = 'none'} />
              </div>
            )}
            <h2 className="question-text">{q.question}</h2>

            <div className={`options-grid ${hasImages ? 'image-options' : 'text-options'}`}>
              {q.options.map((opt, i) => {
                let cls = '';
                if (showCorrect) {
                  if (i === q.correctAnswer) cls = 'correct';
                  else if (i === selected) cls = 'wrong';
                } else if (selected === i) cls = 'selected';

                return (
                  <button key={i} className={`option-btn ${cls}`}
                    onClick={() => handleAnswer(i)}
                    disabled={selected !== null || showCorrect}>
                    <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                    {opt.image && <img src={opt.image} alt="" className="option-image" onError={e => e.target.style.display = 'none'} />}
                    {opt.text && <span className="option-text">{opt.text}</span>}
                  </button>
                );
              })}
            </div>

            {showCorrect && (
              <div className={`answer-feedback ${selected === q.correctAnswer ? 'correct-fb' : 'wrong-fb'}`}>
                {selected === q.correctAnswer
                  ? `✅ Correct! +${q.points} points`
                  : `❌ Wrong! Correct: ${String.fromCharCode(65 + q.correctAnswer)}`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── FINISHED ── */}
      {phase === 'finished' && (
        <div className="battle-result">
          <div className="result-card">
            <div className="result-emoji">🏆</div>
            <h1>Battle Complete!</h1>
            <p style={{ color: 'var(--text2)', marginBottom: 24 }}>Final Scores</p>
            <div className="final-scores">
              {sortedScores.length === 0
                ? players.map((p, i) => (
                  <div key={p.id} className={`final-score-item rank-${i + 1}`}>
                    <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                    <span>{p.id === user._id ? 'You' : p.name}</span>
                    <span>⭐ 0 pts</span>
                  </div>
                ))
                : sortedScores.map(([id, pts], i) => (
                  <div key={id} className={`final-score-item rank-${i + 1}`}>
                    <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                    <span>{id === user._id ? 'You' : players.find(p => p.id === id)?.name || 'Player'}</span>
                    <span>⭐ {pts} pts</span>
                  </div>
                ))
              }
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
              <button className="btn btn-primary" onClick={resetBattle}>🔄 Play Again</button>
              <button className="btn btn-secondary" onClick={resetBattle}>← Back to Lobby</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}