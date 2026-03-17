import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './LessonDetail.css';

export default function LessonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [activeContent, setActiveContent] = useState(0);

  useEffect(() => {
    axios.get(`/api/lessons/${id}`).then(r => { setLesson(r.data); setLoading(false); });
  }, [id]);

  const getEmbedUrl = (url) => {
    if (!url) return '';
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const markComplete = async () => {
    try {
      await axios.post(`/api/lessons/${id}/complete`);
      setCompleted(true);
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!lesson) return <div className="empty-state"><h3>Lesson not found</h3></div>;

  const contents = lesson.contents || [];

  return (
    <div className="lesson-detail">
      <div className="lesson-detail-header">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
        <span className="badge badge-primary">{lesson.subject || 'General'}</span>
      </div>

      <div className="lesson-layout">
        <div className="lesson-main">

          {/* TITLE BLOCK */}
          <div className="lesson-info-block">
            <h1>{lesson.title}</h1>
            <div className="lesson-meta-row">
              <span>👨‍🏫 {lesson.teacher?.name}</span>
              <span>⭐ {lesson.pointsReward} points</span>
              <span>👁️ {lesson.viewCount} views</span>
            </div>
            {lesson.description && <p className="lesson-desc">{lesson.description}</p>}
          </div>

          {/* VIDEO SECTION */}
          {lesson.videoUrl && (
            <div className="content-section">
              <h2>🎬 Learning Video</h2>
              <div className="video-wrapper">
                <iframe
                  src={getEmbedUrl(lesson.videoUrl)}
                  title="Lesson Video"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </div>
          )}

          {/* EXTRA CONTENT TABS */}
          {contents.length > 0 && (
            <div className="content-section">
              <h2>📖 Learning Content</h2>
              <div className="content-tabs">
                {contents.map((c, i) => (
                  <button key={i}
                    className={`content-tab ${activeContent === i ? 'active' : ''}`}
                    onClick={() => setActiveContent(i)}>
                    {c.type === 'video' ? '🎬' : c.type === 'image' ? '🖼️' : '📝'}
                    {` Part ${i + 1}`}
                  </button>
                ))}
              </div>
              <div className="content-display">
                {(() => {
                  const c = contents[activeContent];
                  if (!c) return null;
                  if (c.type === 'image') return (
                    <div className="image-content">
                      <img src={c.url} alt={c.caption || ''} />
                      {c.caption && <p className="caption">{c.caption}</p>}
                    </div>
                  );
                  if (c.type === 'video') return (
                    <div className="video-wrapper">
                      <iframe src={getEmbedUrl(c.url)} allowFullScreen title="Content Video" />
                    </div>
                  );
                  return <div className="text-content"><p>{c.text}</p></div>;
                })()}
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div className="lesson-actions">
            {lesson.quiz && (
              <Link to={`/quizzes/${lesson.quiz._id || lesson.quiz}/play`} className="btn btn-primary" style={{ fontSize: 16, padding: '14px 28px' }}>
                🎯 Take Quiz for this Lesson
              </Link>
            )}
            {!completed ? (
              <button className="btn btn-success" onClick={markComplete} style={{ fontSize: 16, padding: '14px 28px' }}>
                ✅ Mark Complete (+{lesson.pointsReward} pts)
              </button>
            ) : (
              <div className="completed-badge">
                🎉 Lesson Completed! You earned {lesson.pointsReward} points!
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="lesson-sidebar">
          <div className="card">
            <h3>📋 Lesson Details</h3>
            <div className="detail-list">
              <div className="detail-item"><span>Subject</span><span>{lesson.subject || 'General'}</span></div>
              <div className="detail-item"><span>Content Items</span><span>{contents.length}</span></div>
              <div className="detail-item"><span>Has Video</span><span>{lesson.videoUrl ? '🎬 Yes' : '❌ No'}</span></div>
              <div className="detail-item"><span>Has Quiz</span><span>{lesson.quiz ? '✅ Yes' : '❌ No'}</span></div>
              <div className="detail-item"><span>Points</span><span>⭐ {lesson.pointsReward}</span></div>
            </div>
          </div>

          {lesson.quiz && (
            <div className="card" style={{ marginTop: 16, background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(67,198,172,0.1))', border: '2px solid var(--primary)' }}>
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: 40 }}>🎯</div>
                <h3 style={{ margin: '8px 0 4px' }}>Quiz Available!</h3>
                <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 16 }}>Test your knowledge on this lesson</p>
                <Link to={`/quizzes/${lesson.quiz._id || lesson.quiz}/play`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  🚀 Start Quiz
                </Link>
              </div>
            </div>
          )}

          {lesson.tags?.length > 0 && (
            <div className="card" style={{ marginTop: 16 }}>
              <h3>🏷️ Tags</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {lesson.tags.map(tag => <span key={tag} className="badge badge-primary">{tag}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
