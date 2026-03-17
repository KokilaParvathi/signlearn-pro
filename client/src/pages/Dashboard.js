import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { t } from '../utils/translations';
import './Dashboard.css';

const LEVEL_THRESHOLDS = [0, 50, 150, 300, 500, 800, 1200, 1800, 2600, 3600];

export default function Dashboard() {
  const { user } = useAuth();
  const { language } = useTheme();
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [l, q, lb] = await Promise.all([
          axios.get('/api/lessons'),
          axios.get('/api/quizzes'),
          axios.get('/api/leaderboard')
        ]);
        setLessons(l.data.slice(0, 3));
        setQuizzes(q.data.slice(0, 3));
        setLeaderboard(lb.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentLevel = user?.level || 1;
  const points = user?.points || 0;
  const nextLevelPoints = LEVEL_THRESHOLDS[currentLevel] || 9999;
  const prevLevelPoints = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
  const progress = Math.min(100, ((points - prevLevelPoints) / (nextLevelPoints - prevLevelPoints)) * 100);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="dashboard">
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1 className="welcome-title">{t(language, 'welcomeBack')}, {user?.name}! 👋</h1>
          <p className="welcome-sub">{t(language, 'readyToLearn')}</p>
          <div className="level-progress">
            <div className="level-info">
              <span>🎖️ {t(language, 'level')} {currentLevel}</span>
              <span>{points} / {nextLevelPoints} pts</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
        <div className="welcome-decoration">
          <div className="deco-emoji">🎓</div>
        </div>
      </div>

      <div className="stats-row">
        {[
          { icon: '📚', label: t(language, 'totalLessons'), value: lessons.length, color: '#6C63FF', bg: 'rgba(108,99,255,0.1)' },
          { icon: '🎯', label: t(language, 'totalQuizzes'), value: quizzes.length, color: '#FF6584', bg: 'rgba(255,101,132,0.1)' },
          { icon: '⭐', label: t(language, 'pointsEarned'), value: points, color: '#FFB347', bg: 'rgba(255,179,71,0.1)' },
          { icon: '🏆', label: t(language, 'yourRank'), value: `#${leaderboard.findIndex(u => u._id === user?._id) + 1 || '-'}`, color: '#43C6AC', bg: 'rgba(67,198,172,0.1)' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>📚 {t(language, 'recentLessons')}</h2>
            <Link to="/lessons" className="btn btn-secondary">{t(language, 'viewAll')}</Link>
          </div>
          {lessons.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📖</div>
              <h3>{t(language, 'noLessons')}</h3>
              <p>{t(language, 'noLessonsDesc')}</p>
            </div>
          ) : (
            <div className="lesson-list">
              {lessons.map(lesson => (
                <Link to={`/lessons/${lesson._id}`} key={lesson._id} className="lesson-item card">
                  <div className="lesson-thumb">
                    {lesson.thumbnail ? <img src={lesson.thumbnail} alt="" /> : <span>📚</span>}
                  </div>
                  <div className="lesson-info">
                    <h3>{lesson.title}</h3>
                    <p>{lesson.description || 'Click to start learning'}</p>
                    <div className="lesson-meta">
                      <span className="badge badge-primary">{lesson.subject || t(language, 'general')}</span>
                      <span>⭐ {lesson.pointsReward} pts</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-aside">
          <div className="dashboard-section">
            <div className="section-header">
              <h2>🏆 {t(language, 'topStudents')}</h2>
              <Link to="/leaderboard" className="btn btn-secondary">{t(language, 'fullBoard')}</Link>
            </div>
            {leaderboard.map((student, index) => (
              <div className="rank-item" key={student._id}>
                <div className={`rank-num rank-${index + 1}`}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>
                <div className="rank-avatar">{student.name?.[0]?.toUpperCase()}</div>
                <div className="rank-info">
                  <div className="rank-name">{student.name}</div>
                  <div className="rank-pts">⭐ {student.points} pts</div>
                </div>
                <div className="rank-level">Lv.{student.level || 1}</div>
              </div>
            ))}
          </div>

          <div className="quick-actions">
            <h2>🚀 {t(language, 'quickActions')}</h2>
            <div className="action-grid">
              {user?.role !== 'student' ? (
                <>
                  <Link to="/manage/lessons" className="action-btn">➕ {t(language, 'addLesson')}</Link>
                  <Link to="/manage/quizzes" className="action-btn">🎯 {t(language, 'createQuiz')}</Link>
                  <Link to="/manage/users" className="action-btn">👥 {t(language, 'addStudent')}</Link>
                  <Link to="/chat" className="action-btn">📢 {t(language, 'announce')}</Link>
                </>
              ) : (
                <>
                  <Link to="/lessons" className="action-btn">📚 {t(language, 'browseLesson')}</Link>
                  <Link to="/quizzes" className="action-btn">🎯 {t(language, 'takeQuiz')}</Link>
                  <Link to="/quiz-battle" className="action-btn">⚔️ {t(language, 'battleNow')}</Link>
                  <Link to="/chat" className="action-btn">💬 {t(language, 'chat')}</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
