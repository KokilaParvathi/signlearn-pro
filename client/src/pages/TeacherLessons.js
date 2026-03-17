import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './TeacherPages.css';

export default function TeacherLessons() {
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', subject: '', videoUrl: '',
    thumbnail: '', pointsReward: 10, isPublished: false, tags: '', contents: []
  });
  const [loading, setLoading] = useState(true);
  const [showStudents, setShowStudents] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [videoPreview, setVideoPreview] = useState('');
  const [thumbDrag, setThumbDrag] = useState(false);

  useEffect(() => {
    Promise.all([axios.get('/api/lessons'), axios.get('/api/users/students')])
      .then(([l, s]) => { setLessons(l.data); setStudents(s.data); setLoading(false); });
  }, []);

  const getEmbedUrl = (url) => {
    if (!url) return '';
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const fileToBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const handleThumbnailFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const b64 = await fileToBase64(file);
    setForm(f => ({ ...f, thumbnail: b64 }));
  }, []);

  const openModal = (lesson = null) => {
    setEditing(lesson);
    const f = lesson
      ? { ...lesson, tags: lesson.tags?.join(', ') || '' }
      : { title: '', description: '', subject: '', videoUrl: '', thumbnail: '', pointsReward: 10, isPublished: false, tags: '', contents: [] };
    setForm(f);
    setVideoPreview(f.videoUrl ? getEmbedUrl(f.videoUrl) : '');
    setShowModal(true);
  };

  const saveLesson = async (e) => {
    e.preventDefault();
    const data = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [] };
    try {
      if (editing) {
        const r = await axios.put(`/api/lessons/${editing._id}`, data);
        setLessons(prev => prev.map(l => l._id === editing._id ? r.data : l));
      } else {
        const r = await axios.post('/api/lessons', data);
        setLessons(prev => [r.data, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving lesson');
    }
  };

  const deleteLesson = async (id) => {
    if (!window.confirm('Delete this lesson?')) return;
    await axios.delete(`/api/lessons/${id}`);
    setLessons(prev => prev.filter(l => l._id !== id));
  };

  const addStudentsToLesson = async (lessonId) => {
    await axios.post(`/api/lessons/${lessonId}/add-students`, { studentIds: selectedStudents });
    setShowStudents(null);
    setSelectedStudents([]);
    alert('Students added successfully!');
  };

  const addContent = () => {
    setForm(f => ({
      ...f,
      contents: [...(f.contents || []), { type: 'text', text: '', url: '', caption: '', order: f.contents?.length || 0 }]
    }));
  };

  const updateContent = (i, field, val) => {
    const c = [...form.contents];
    c[i] = { ...c[i], [field]: val };
    setForm(f => ({ ...f, contents: c }));
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      <div className="flex-between page-header">
        <div>
          <h1>📚 My Lessons</h1>
          <p>Create lessons with thumbnail images, videos and learning content</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>➕ Create Lesson</button>
      </div>

      {lessons.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📚</div>
          <h3>No lessons yet</h3>
          <p>Create your first lesson to get started</p>
        </div>
      ) : (
        <div className="manage-grid">
          {lessons.map(lesson => (
            <div key={lesson._id} className="manage-card">
              {/* Thumbnail preview on card */}
              {lesson.thumbnail && (
                <div className="manage-card-thumb">
                  <img src={lesson.thumbnail} alt={lesson.title} />
                </div>
              )}
              <div className="manage-card-header">
                <div>
                  <h3>{lesson.title}</h3>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                    <span className="badge badge-primary">{lesson.subject || 'General'}</span>
                    {lesson.isPublished
                      ? <span className="badge badge-success">✅ Published</span>
                      : <span className="badge badge-warning">📝 Draft</span>}
                    {lesson.videoUrl && <span className="badge badge-primary">🎬 Video</span>}
                  </div>
                </div>
              </div>
              <p>{lesson.description || 'No description'}</p>
              <div className="card-stats">
                <span>📄 {lesson.contents?.length || 0} items</span>
                <span>👥 {lesson.students?.length || 0} students</span>
                <span>⭐ {lesson.pointsReward} pts</span>
              </div>
              <div className="card-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => openModal(lesson)}>✏️ Edit</button>
                <button className="btn btn-secondary btn-sm" onClick={() => { setShowStudents(lesson._id); setSelectedStudents([]); }}>👥 Students</button>
                <button className="btn btn-danger btn-sm" onClick={() => deleteLesson(lesson._id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? '✏️ Edit Lesson' : '➕ Create Lesson'}</h2>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={saveLesson}>
              <div className="form-row">
                <div className="form-group">
                  <label>📝 Title *</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Lesson title" />
                </div>
                <div className="form-group">
                  <label>📖 Subject</label>
                  <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Math, Science, English..." />
                </div>
              </div>

              <div className="form-group">
                <label>📄 Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="What will students learn?" />
              </div>

              {/* THUMBNAIL UPLOAD */}
              <div className="form-group">
                <label>🖼️ Lesson Thumbnail Image</label>
                <div
                  className={`thumb-upload-zone ${thumbDrag ? 'drag-over' : ''} ${form.thumbnail ? 'has-image' : ''}`}
                  onDragOver={e => { e.preventDefault(); setThumbDrag(true); }}
                  onDragLeave={() => setThumbDrag(false)}
                  onDrop={async (e) => {
                    e.preventDefault();
                    setThumbDrag(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleThumbnailFile(file);
                  }}
                >
                  {form.thumbnail ? (
                    <div className="thumb-preview-wrap">
                      <img src={form.thumbnail} alt="Thumbnail" className="thumb-preview-img" />
                      <button type="button" className="thumb-remove-btn" onClick={() => setForm(f => ({ ...f, thumbnail: '' }))}>✕ Remove</button>
                    </div>
                  ) : (
                    <div className="thumb-upload-placeholder">
                      <div className="thumb-upload-icon">🖼️</div>
                      <p className="thumb-upload-text">Drag & drop or click to upload thumbnail</p>
                      <p className="thumb-upload-hint">JPG, PNG, GIF supported</p>
                      <input
                        type="file"
                        accept="image/*"
                        className="thumb-file-input"
                        onChange={e => handleThumbnailFile(e.target.files?.[0])}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* VIDEO */}
              <div className="video-input-section">
                <label>🎬 Learning Video (YouTube URL)</label>
                <div className="video-url-row">
                  <input
                    value={form.videoUrl}
                    onChange={e => {
                      setForm({ ...form, videoUrl: e.target.value });
                      setVideoPreview(getEmbedUrl(e.target.value));
                    }}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  {form.videoUrl && (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setVideoPreview(getEmbedUrl(form.videoUrl))}>
                      👁️ Preview
                    </button>
                  )}
                </div>
                {videoPreview && (
                  <div className="video-preview-box">
                    <iframe src={videoPreview} title="Video Preview" allowFullScreen />
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>⭐ Points Reward</label>
                  <input type="number" value={form.pointsReward} onChange={e => setForm({ ...form, pointsReward: Number(e.target.value) })} min={1} />
                </div>
                <div className="form-group">
                  <label>🏷️ Tags (comma separated)</label>
                  <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="math, beginner, visual" />
                </div>
              </div>

              {/* CONTENT ITEMS */}
              <div className="content-builder">
                <div className="flex-between" style={{ marginBottom: 12 }}>
                  <label style={{ fontWeight: 700 }}>📖 Extra Learning Content</label>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addContent}>➕ Add Item</button>
                </div>
                {(form.contents || []).map((c, i) => (
                  <div key={i} className="content-item-form">
                    <select value={c.type} onChange={e => updateContent(i, 'type', e.target.value)}>
                      <option value="text">📝 Text</option>
                      <option value="image">🖼️ Image URL</option>
                      <option value="video">🎬 Video URL</option>
                    </select>
                    {c.type === 'text' ? (
                      <textarea rows={2} placeholder="Write content here..." value={c.text}
                        onChange={e => updateContent(i, 'text', e.target.value)} />
                    ) : (
                      <input placeholder={c.type === 'image' ? 'Image URL...' : 'YouTube URL...'}
                        value={c.url} onChange={e => updateContent(i, 'url', e.target.value)} />
                    )}
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => setForm(f => ({ ...f, contents: f.contents.filter((_, j) => j !== i) }))}>✕</button>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.isPublished}
                    onChange={e => setForm({ ...form, isPublished: e.target.checked })} style={{ width: 'auto' }} />
                  ✅ Publish this lesson (students can see it)
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? '💾 Update Lesson' : '✅ Create Lesson'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showStudents && (
        <div className="modal-overlay" onClick={() => setShowStudents(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>👥 Add Students to Lesson</h2>
            <div className="student-select-list">
              {students.length === 0 ? (
                <p style={{ color: 'var(--text2)', padding: 16 }}>No students registered yet.</p>
              ) : students.map(s => (
                <label key={s._id} className="student-select-item">
                  <input type="checkbox" checked={selectedStudents.includes(s._id)}
                    onChange={e => setSelectedStudents(prev =>
                      e.target.checked ? [...prev, s._id] : prev.filter(id => id !== s._id)
                    )} style={{ width: 'auto' }} />
                  <div className="ss-avatar">{s.name?.[0]?.toUpperCase()}</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{s.email}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowStudents(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => addStudentsToLesson(showStudents)}
                disabled={selectedStudents.length === 0}>
                ✅ Add {selectedStudents.length} Students
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}