import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Quizzes.css';

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/quizzes').then(r => { setQuizzes(r.data); setLoading(false); });
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1>🎯 Quizzes</h1>
        <p>Test your knowledge with fun, visual quizzes</p>
      </div>

      {quizzes.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🎯</div>
          <h3>No quizzes available yet</h3>
          <p>Check back soon for new quizzes</p>
        </div>
      ) : (
        <div className="quiz-grid">
          {quizzes.map(quiz => (
            <div key={quiz._id} className="quiz-card">
              <div className="quiz-card-icon">🎯</div>
              <div className="quiz-card-body">
                <h3>{quiz.title}</h3>
                <p className="quiz-lesson">{quiz.lesson?.title ? `📚 ${quiz.lesson.title}` : 'General Quiz'}</p>
                <div className="quiz-stats">
                  <span>❓ {quiz.questions?.length || 0} questions</span>
                  <span>⭐ {quiz.totalPoints || 0} pts</span>
                  <span>⏱️ {quiz.timeLimit}s/q</span>
                </div>
                {quiz.isBattleEnabled && (
                  <span className="badge badge-warning battle-badge">⚔️ Battle Enabled</span>
                )}
              </div>
              <div className="quiz-card-actions">
                <Link to={`/quizzes/${quiz._id}/play`} className="btn btn-primary">
                  🚀 Start Quiz
                </Link>
                {quiz.isBattleEnabled && (
                  <Link to="/quiz-battle" state={{ quizId: quiz._id }} className="btn btn-secondary">
                    ⚔️ Battle
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
