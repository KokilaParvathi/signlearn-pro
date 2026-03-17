import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './QuizPlay.css';

export default function QuizPlay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [timer, setTimer] = useState(0);
  const [phase, setPhase] = useState('loading');
  const [result, setResult] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [showCorrect, setShowCorrect] = useState(false);

  useEffect(() => {
    axios.get(`/api/quizzes/${id}`).then(r => {
      setQuiz(r.data);
      setTimer(r.data.timeLimit || 30);
      setPhase('playing');
      setStartTime(Date.now());
    });
  }, [id]);

  const nextQuestion = useCallback((forcedAnswer) => {
    const ans = forcedAnswer !== undefined ? forcedAnswer : (selected ?? -1);
    const newAnswers = [...answers, ans];
    setAnswers(newAnswers);
    setShowCorrect(true);

    setTimeout(() => {
      setShowCorrect(false);
      setSelected(null);
      if (currentQ + 1 >= quiz.questions.length) {
        const timeTaken = Math.round((Date.now() - startTime) / 1000);
        axios.post(`/api/quizzes/${id}/submit`, { answers: newAnswers, timeTaken })
          .then(r => { setResult(r.data); setPhase('result'); });
      } else {
        setCurrentQ(q => q + 1);
        setTimer(quiz.timeLimit || 30);
      }
    }, 1200);
  }, [answers, selected, currentQ, quiz, id, startTime]);

  useEffect(() => {
    if (phase !== 'playing' || showCorrect) return;
    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { nextQuestion(-1); return quiz?.timeLimit || 30; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, nextQuestion, quiz, showCorrect]);

  const handleSelect = (i) => {
    if (selected !== null || showCorrect) return;
    setSelected(i);
    nextQuestion(i);
  };

  const getOptionClass = (i, q) => {
    if (!showCorrect) return selected === i ? 'selected' : '';
    if (i === q.correctAnswer) return 'correct';
    if (i === selected && selected !== q.correctAnswer) return 'wrong';
    return '';
  };

  if (phase === 'loading') return <div className="loading-spinner"><div className="spinner" /></div>;

  if (phase === 'result') {
    const pct = Math.round((result.score / result.total) * 100);
    return (
      <div className="quiz-result">
        <div className="result-card">
          <div className="result-emoji">{pct >= 80 ? '🏆' : pct >= 60 ? '🎉' : pct >= 40 ? '👍' : '💪'}</div>
          <h1>{pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Great Job!' : pct >= 40 ? 'Good Try!' : 'Keep Practicing!'}</h1>
          <div className="score-circle" style={{ '--pct': pct }}>
            <span>{pct}%</span>
          </div>
          <div className="result-stats">
            <div className="result-stat"><span className="rs-icon">✅</span><span className="rs-val">{result.score}</span><span className="rs-label">Correct</span></div>
            <div className="result-stat"><span className="rs-icon">❌</span><span className="rs-val">{result.total - result.score}</span><span className="rs-label">Wrong</span></div>
            <div className="result-stat"><span className="rs-icon">⭐</span><span className="rs-val">{result.pointsEarned}</span><span className="rs-label">Points</span></div>
          </div>
          <div className="result-actions">
            <button className="btn btn-primary" onClick={() => {
              setCurrentQ(0); setAnswers([]); setSelected(null);
              setTimer(quiz.timeLimit); setPhase('playing');
              setStartTime(Date.now()); setResult(null); setShowCorrect(false);
            }}>🔄 Try Again</button>
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  const q = quiz.questions[currentQ];
  const progress = (currentQ / quiz.questions.length) * 100;
  const timerPct = (timer / (quiz.timeLimit || 30)) * 100;
  const hasImages = q.options.some(o => o.image);

  return (
    <div className="quiz-play">
      <div className="quiz-header">
        <div>
          <h2>{quiz.title}</h2>
          <p>Question {currentQ + 1} of {quiz.questions.length}</p>
        </div>
        <div className={`timer ${timer <= 5 ? 'urgent' : ''}`}>
          <span className="timer-value">{timer}</span>
          <div className="timer-bar">
            <div className="timer-fill" style={{ width: `${timerPct}%`, background: timer <= 5 ? '#FF6B6B' : '#43C6AC' }} />
          </div>
        </div>
      </div>

      <div className="quiz-progress">
        <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="question-card">
        {/* Question image */}
        {q.questionImage && (
          <div className="question-image">
            <img src={q.questionImage} alt="Question visual" onError={e => e.target.style.display='none'} />
          </div>
        )}

        <h2 className="question-text">{q.question}</h2>

        {/* Options — layout adapts to image/text */}
        <div className={`options-grid ${hasImages ? 'image-options' : 'text-options'}`}>
          {q.options.map((opt, i) => (
            <button
              key={i}
              className={`option-btn ${getOptionClass(i, q)}`}
              onClick={() => handleSelect(i)}
              disabled={selected !== null || showCorrect}
            >
              <span className="option-letter">{String.fromCharCode(65 + i)}</span>
              {opt.image && (
                <img src={opt.image} alt={`Option ${String.fromCharCode(65 + i)}`}
                  className="option-image" onError={e => e.target.style.display='none'} />
              )}
              {opt.text && <span className="option-text">{opt.text}</span>}
              {showCorrect && i === q.correctAnswer && (
                <span className="correct-indicator">✅</span>
              )}
              {showCorrect && i === selected && selected !== q.correctAnswer && (
                <span className="correct-indicator">❌</span>
              )}
            </button>
          ))}
        </div>

        {showCorrect && (
          <div className={`answer-feedback ${selected === q.correctAnswer ? 'correct-fb' : 'wrong-fb'}`}>
            {selected === q.correctAnswer
              ? `✅ Correct! +${q.points} points`
              : `❌ Wrong! Correct answer: ${String.fromCharCode(65 + q.correctAnswer)}`}
          </div>
        )}
      </div>

      <div className="quiz-nav">
        <div className="points-badge">⭐ {q.points} pts for this question</div>
        <button className="btn btn-primary" onClick={() => nextQuestion()} disabled={showCorrect}>
          {currentQ + 1 === quiz.questions.length ? '✅ Submit' : 'Skip →'}
        </button>
      </div>
    </div>
  );
}
