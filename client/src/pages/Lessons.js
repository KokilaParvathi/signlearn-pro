import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { t } from '../utils/translations';
import './Lessons.css';

export default function Lessons() {
  const { language } = useTheme();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    axios.get('/api/lessons').then(r => { setLessons(r.data); setLoading(false); });
  }, []);

  const subjects = ['all', ...new Set(lessons.map(l => l.subject).filter(Boolean))];
  const filtered = lessons.filter(l =>
    (filter === 'all' || l.subject === filter) &&
    l.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1>📚 {t(language, 'lessons')}</h1>
        <p>Visual learning content designed for you</p>
      </div>

      <div className="lessons-toolbar">
        <input
          className="search-input"
          placeholder={t(language, 'searchLessons')}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="filter-tabs">
          {subjects.map(s => (
            <button
              key={s}
              className={`filter-tab ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === 'all' ? `🌟 ${t(language, 'lessons')}` : s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📖</div>
          <h3>{t(language, 'noLessons')}</h3>
          <p>{t(language, 'noLessonsDesc')}</p>
        </div>
      ) : (
        <div className="lessons-grid">
          {filtered.map(lesson => (
            <Link to={`/lessons/${lesson._id}`} key={lesson._id} className="lesson-card">
              <div className="lesson-card-thumb">
                {lesson.thumbnail
                  ? <img src={lesson.thumbnail} alt="" />
                  : <div className="thumb-placeholder">📚</div>}
                <div className="lesson-points-badge">⭐ {lesson.pointsReward} pts</div>
              </div>
              <div className="lesson-card-body">
                <div className="lesson-subject">
                  <span className="badge badge-primary">{lesson.subject || t(language, 'general')}</span>
                </div>
                <h3>{lesson.title}</h3>
                <p>{lesson.description || 'Click to start learning'}</p>
                <div className="lesson-card-footer">
                  <span>👨‍🏫 {lesson.teacher?.name}</span>
                  <span>{lesson.contents?.length || 0} items</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
