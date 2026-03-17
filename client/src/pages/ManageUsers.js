import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './TeacherPages.css';

export default function ManageUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    axios.get('/api/users').then(r => { setUsers(r.data); setLoading(false); });
  }, []);

  const createUser = async (e) => {
    e.preventDefault();
    try {
      const r = await axios.post('/api/users', form);
      setUsers(prev => [r.data, ...prev]);
      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'student' });
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating user');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await axios.delete(`/api/users/${id}`);
    setUsers(prev => prev.filter(u => u._id !== id));
  };

  const filtered = users.filter(u => filter === 'all' || u.role === filter);
  const roleColors = { admin: 'danger', teacher: 'success', student: 'primary' };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      <div className="flex-between page-header">
        <div>
          <h1>👥 Manage Users</h1>
          <p>View and manage all platform users</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>➕ Add User</button>
      </div>

      <div className="filter-tabs" style={{ marginBottom: 24 }}>
        {['all', 'student', 'teacher', 'admin'].map(r => (
          <button key={r} className={`filter-tab ${filter === r ? 'active' : ''}`} onClick={() => setFilter(r)}>
            {r === 'all' ? '🌟 All' : r === 'student' ? '🎓 Students' : r === 'teacher' ? '👨‍🏫 Teachers' : '🔑 Admins'}
            {' '}({users.filter(u => r === 'all' ? true : u.role === r).length})
          </button>
        ))}
      </div>

      <div className="user-table">
        <div className="user-table-header">
          <span>User</span>
          <span>Email</span>
          <span>Role</span>
          <span>Points</span>
          <span>Actions</span>
        </div>
        {filtered.map(u => (
          <div key={u._id} className="user-row">
            <div className="user-info">
              <div className="user-av" style={{ background: u.role === 'teacher' ? '#43C6AC' : u.role === 'admin' ? '#FF6584' : '#6C63FF' }}>
                {u.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="user-name">{u.name}</div>
                <div className="user-email" style={{ display: 'none' }}>{u.email}</div>
              </div>
            </div>
            <span style={{ fontSize: 14, color: 'var(--text2)' }}>{u.email}</span>
            <span><span className={`badge badge-${roleColors[u.role]}`}>{u.role}</span></span>
            <span style={{ fontWeight: 700 }}>⭐ {u.points || 0}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {user?.role === 'admin' && u._id !== user._id && (
                <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u._id)}>🗑️</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>➕ Add New User</h2>
            <form onSubmit={createUser}>
              <div className="form-group">
                <label>👤 Full Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Full name" />
              </div>
              <div className="form-group">
                <label>📧 Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="Email address" />
              </div>
              <div className="form-group">
                <label>🔒 Password</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="Password" />
              </div>
              <div className="form-group">
                <label>🎭 Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  {user?.role === 'admin' && <option value="admin">Admin</option>}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">✅ Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
