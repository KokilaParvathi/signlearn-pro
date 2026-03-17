import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './TeacherPages.css';

const emptyOption  = () => ({ text: '', image: '' });
const emptyQuestion = () => ({
  question: '', questionImage: '',
  options: [emptyOption(), emptyOption(), emptyOption(), emptyOption()],
  correctAnswer: 0, points: 5, type: 'mcq'
});

/* Convert pasted / dropped file to base64 data-URL */
const fileToDataUrl = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result);
  r.onerror = rej;
  r.readAsDataURL(file);
});

/* Image input that supports: URL typing + paste + file pick */
function ImageInput({ value, onChange, placeholder = '🖼️ Image URL or paste/upload image' }) {
  const [drag, setDrag] = useState(false);

  const handlePaste = useCallback(async (e) => {
    const items = Array.from(e.clipboardData?.items || []);
    const imgItem = items.find(it => it.type.startsWith('image/'));
    if (imgItem) {
      e.preventDefault();
      const file = imgItem.getAsFile();
      const dataUrl = await fileToDataUrl(file);
      onChange(dataUrl);
    }
  }, [onChange]);

  const handleFile = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    onChange(dataUrl);
  }, [onChange]);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const dataUrl = await fileToDataUrl(file);
      onChange(dataUrl);
    }
  }, [onChange]);

  return (
    <div>
      <input
        value={value.startsWith('data:') ? '' : value}
        onChange={e => onChange(e.target.value)}
        onPaste={handlePaste}
        placeholder={placeholder}
        style={{ marginBottom: 4 }}
      />
      <div className={`paste-zone ${drag ? 'drag-over' : ''}`}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}>
        📋 Paste image (Ctrl+V) or click to upload
        <input type="file" accept="image/*" onChange={handleFile} />
      </div>
      {value && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <img src={value} alt="preview" className="pasted-img-preview"
            onError={e => e.target.style.display = 'none'} />
          <button type="button" className="btn btn-danger btn-sm"
            onClick={() => onChange('')} style={{ padding: '4px 10px' }}>✕ Remove</button>
        </div>
      )}
    </div>
  );
}

export default function TeacherQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm] = useState({
    title: '', lesson: '', timeLimit: 30, isBattleEnabled: true,
    questions: [emptyQuestion()]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([axios.get('/api/quizzes'), axios.get('/api/lessons')])
      .then(([q, l]) => { setQuizzes(q.data); setLessons(l.data); setLoading(false); });
  }, []);

  const openModal = (quiz = null) => {
    setEditing(quiz);
    if (quiz) {
      setForm({
        ...quiz,
        questions: quiz.questions.map(q => ({
          ...q,
          questionImage: q.questionImage || '',
          options: q.options.map(o => ({ text: o.text || '', image: o.image || '' }))
        }))
      });
    } else {
      setForm({ title: '', lesson: '', timeLimit: 30, isBattleEnabled: true, questions: [emptyQuestion()] });
    }
    setShowModal(true);
  };

  const saveQuiz = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const r = await axios.put(`/api/quizzes/${editing._id}`, form);
        setQuizzes(prev => prev.map(q => q._id === editing._id ? r.data : q));
      } else {
        const r = await axios.post('/api/quizzes', form);
        setQuizzes(prev => [r.data, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving quiz');
    }
  };

  const deleteQuiz = async (id) => {
    if (!window.confirm('Delete this quiz?')) return;
    await axios.delete(`/api/quizzes/${id}`);
    setQuizzes(prev => prev.filter(q => q._id !== id));
  };

  const updateQ = (qi, field, val) => {
    const qs = [...form.questions];
    qs[qi] = { ...qs[qi], [field]: val };
    setForm(f => ({ ...f, questions: qs }));
  };

  const updateOpt = (qi, oi, field, val) => {
    const qs = [...form.questions];
    const opts = [...qs[qi].options];
    opts[oi] = { ...opts[oi], [field]: val };
    qs[qi] = { ...qs[qi], options: opts };
    setForm(f => ({ ...f, questions: qs }));
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      <div className="flex-between page-header">
        <div>
          <h1>🎯 My Quizzes</h1>
          <p>Create quizzes — text, images, or both for questions and options</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>➕ Create Quiz</button>
      </div>

      {quizzes.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🎯</div>
          <h3>No quizzes yet</h3>
          <p>Create your first quiz</p>
        </div>
      ) : (
        <div className="manage-grid">
          {quizzes.map(quiz => (
            <div key={quiz._id} className="manage-card">
              <div className="manage-card-header"><h3>{quiz.title}</h3></div>
              <p>{quiz.lesson?.title ? `📚 ${quiz.lesson.title}` : 'No lesson linked'}</p>
              <div className="card-stats">
                <span>❓ {quiz.questions?.length || 0} Q</span>
                <span>⭐ {quiz.totalPoints} pts</span>
                <span>⏱️ {quiz.timeLimit}s</span>
                {quiz.isBattleEnabled && <span>⚔️ Battle</span>}
              </div>
              <div className="card-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => openModal(quiz)}>✏️ Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => deleteQuiz(quiz._id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? '✏️ Edit Quiz' : '➕ Create Quiz'}</h2>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={saveQuiz}>
              <div className="form-row">
                <div className="form-group">
                  <label>Quiz Title *</label>
                  <input value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })} required
                    placeholder="Quiz title" />
                </div>
                <div className="form-group">
                  <label>📚 Link to Lesson</label>
                  <select value={form.lesson}
                    onChange={e => setForm({ ...form, lesson: e.target.value })}>
                    <option value="">-- Select Lesson (optional) --</option>
                    {lessons.map(l => <option key={l._id} value={l._id}>{l.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>⏱️ Time per Question (seconds)</label>
                  <input type="number" value={form.timeLimit}
                    onChange={e => setForm({ ...form, timeLimit: Number(e.target.value) })} min={5} />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center' }}>
                  <label className="checkbox-label" style={{ marginTop: 28 }}>
                    <input type="checkbox" checked={form.isBattleEnabled}
                      onChange={e => setForm({ ...form, isBattleEnabled: e.target.checked })}
                      style={{ width: 'auto' }} />
                    ⚔️ Enable Quiz Battle
                  </label>
                </div>
              </div>

              <div className="question-builder">
                <div className="flex-between" style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 700, fontSize: 16 }}>
                    ❓ Questions ({form.questions.length})
                  </label>
                  <button type="button" className="btn btn-secondary btn-sm"
                    onClick={() => setForm(f => ({ ...f, questions: [...f.questions, emptyQuestion()] }))}>
                    ➕ Add Question
                  </button>
                </div>

                {form.questions.map((q, qi) => (
                  <div key={qi} className="question-form">
                    <div className="question-form-header">
                      <span style={{ fontWeight: 700 }}>Question {qi + 1}</span>
                      <button type="button" className="btn btn-danger btn-sm"
                        onClick={() => setForm(f => ({ ...f, questions: f.questions.filter((_, i) => i !== qi) }))}>
                        ✕ Remove
                      </button>
                    </div>

                    {/* Question text */}
                    <div className="form-group">
                      <label>Question Text *</label>
                      <input value={q.question}
                        onChange={e => updateQ(qi, 'question', e.target.value)}
                        placeholder="Type your question here..." required />
                    </div>

                    {/* Question image — paste / upload / URL */}
                    <div className="form-group">
                      <label>
                        🖼️ Question Image
                        <span className="optional-tag"> (optional — paste, upload, or URL)</span>
                      </label>
                      <ImageInput
                        value={q.questionImage}
                        onChange={val => updateQ(qi, 'questionImage', val)}
                        placeholder="Paste image URL or paste/upload image below"
                      />
                    </div>

                    {/* Options */}
                    <div className="options-label">
                      <label>Answer Options</label>
                      <span className="hint-text">Each option: text + image (paste, upload, or URL)</span>
                    </div>
                    <div className="options-form-grid">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className={`option-form-card ${q.correctAnswer === oi ? 'correct-option' : ''}`}>
                          <div className="option-form-top">
                            <div className="option-label-badge">{String.fromCharCode(65 + oi)}</div>
                            <label className="correct-radio">
                              <input type="radio" name={`correct-${qi}`}
                                checked={q.correctAnswer === oi}
                                onChange={() => updateQ(qi, 'correctAnswer', oi)} />
                              ✅ Correct
                            </label>
                          </div>
                          <input
                            placeholder={`Option ${String.fromCharCode(65 + oi)} text (optional if image given)`}
                            value={opt.text}
                            onChange={e => updateOpt(qi, oi, 'text', e.target.value)}
                          />
                          <div className="img-or-url">or image</div>
                          <ImageInput
                            value={opt.image}
                            onChange={val => updateOpt(qi, oi, 'image', val)}
                            placeholder="🖼️ Option image URL or paste/upload"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="points-row">
                      <label>⭐ Points for this question:</label>
                      <input type="number" value={q.points}
                        onChange={e => updateQ(qi, 'points', Number(e.target.value))}
                        min={1} style={{ width: 80 }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editing ? '💾 Update Quiz' : '✅ Create Quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
