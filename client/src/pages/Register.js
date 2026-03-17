import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try { await register(form.name, form.email, form.password, form.role); navigate('/dashboard'); }
    catch (err) { setError(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-geo">
        <div className="geo-shape g1"/><div className="geo-shape g2"/>
        <div className="geo-shape g3"/><div className="geo-shape g4"/>
      </div>
      <div className="auth-card">
        <div className="auth-logo-row">
          <div className="auth-logo-box">
            <svg width="26" height="26" viewBox="0 0 26 26">
              <rect x="3" y="14" width="9" height="9" rx="2" fill="white" opacity="0.95"/>
              <rect x="14" y="14" width="9" height="9" rx="2" fill="white" opacity="0.6"/>
              <circle cx="13" cy="13" r="2" fill="#43C6AC"/>
              <path d="M7 10 Q13 7 19 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M4 7 Q13 3 22 7" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity="0.5"/>
            </svg>
          </div>
          <div className="auth-logo-name">
            <div><span className="auth-sign">Sign</span><span className="auth-learn">Learn</span></div>
            <div className="auth-tagline">LEARN WITHOUT LIMITS</div>
          </div>
        </div>
        <div className="auth-tab-row">
          <Link to="/login" className="auth-tab">Sign In</Link>
          <div className="auth-tab active">Register</div>
        </div>
        <div className="auth-form-label">Create your account</div>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="auth-field"><label>Full Name</label>
            <input type="text" placeholder="Your full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
          </div>
          <div className="auth-field"><label>Email Address</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/>
          </div>
          <div className="auth-field"><label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/>
          </div>
          <div className="auth-field"><label>I am a</label>
            <div className="role-tabs">
              <div className={`role-tab ${form.role==='student'?'active':''}`} onClick={()=>setForm({...form,role:'student'})}>Student</div>
              <div className={`role-tab ${form.role==='teacher'?'active':''}`} onClick={()=>setForm({...form,role:'teacher'})}>Teacher</div>
            </div>
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>{loading?'CREATING...':'CREATE ACCOUNT'}</button>
        </form>
        <div className="auth-link">Already have an account? <Link to="/login">Sign in here</Link></div>
      </div>
    </div>
  );
}