import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleContact = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStatus('');
    try {
      const { data } = await axios.post('/api/contact', form);
      setStatus(data.message);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page">

      {/* GEO SHAPES */}
      <div className="landing-geo">
        <div className="lg1"></div>
        <div className="lg2"></div>
        <div className="lg3"></div>
      </div>

      {/* NAVBAR */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <div className="landing-logo-box">
            <svg width="22" height="22" viewBox="0 0 22 22">
              <rect x="2" y="12" width="7" height="7" rx="1.5" fill="white" opacity="0.95"/>
              <rect x="12" y="12" width="7" height="7" rx="1.5" fill="white" opacity="0.6"/>
              <circle cx="11" cy="11" r="1.6" fill="#43C6AC"/>
              <path d="M5 8.5 Q11 5.5 17 8.5" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M2 5.5 Q11 2 20 5.5" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>
            </svg>
          </div>
          <div>
            <div><span className="logo-sign">Sign</span><span className="logo-learn">Learn</span></div>
            <div className="logo-tag">LEARN WITHOUT LIMITS</div>
          </div>
        </div>
        <div className="landing-nav-links">
          <span onClick={() => scrollTo('features')}>Features</span>
          <span onClick={() => scrollTo('about')}>About</span>
          <span onClick={() => scrollTo('contact')}>Contact</span>
        </div>
        <button className="landing-signin-btn" onClick={() => navigate('/login')}>Sign In</button>
      </nav>

      {/* HERO */}
      <section className="landing-hero">
        <div className="hero-badge">
          <div className="hero-badge-dot"></div>
          India's First Visual Learning Platform
        </div>
        <h1 className="hero-title">
          <span>Learn Without</span>
          <span className="hero-t2">Barriers.</span>
          <span className="hero-t3">Grow Without Limits.</span>
        </h1>
        <p className="hero-sub">
          A purpose-built learning platform for deaf and mute students in India.
          Visual lessons, gamified quizzes, real-time battles — no audio required.
        </p>
        <div className="hero-btns">
          <button className="btn-get-started" onClick={() => navigate('/login')}>Get Started</button>
          <button className="btn-learn-more" onClick={() => scrollTo('features')}>Learn More</button>
        </div>
        <div className="hero-stats">
          <div className="hero-stat"><div className="hs-val">8</div><div className="hs-label">Indian Languages</div></div>
          <div className="hero-stat"><div className="hs-val">3</div><div className="hs-label">User Roles</div></div>
          <div className="hero-stat"><div className="hs-val">100%</div><div className="hs-label">Visual Learning</div></div>
          <div className="hero-stat"><div className="hs-val">0</div><div className="hs-label">Audio Required</div></div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="landing-section" id="features">
        <div className="section-header">
          <div className="section-tag">Features</div>
          <h2 className="section-title">Everything you need to learn visually</h2>
          <p className="section-sub">Designed from the ground up for deaf and mute learners across India</p>
        </div>
        <div className="features-grid">
          {[
            { icon: '📚', color: 'p', title: 'Visual Lessons', desc: 'YouTube videos, images and rich visual content — no audio dependency.' },
            { icon: '🎯', color: 't', title: 'Image-Based Quizzes', desc: 'Questions and answers with images. Instant colour-coded visual feedback.' },
            { icon: '⭐', color: 'o', title: 'Gamified Learning', desc: 'Earn points, level up and compete on the leaderboard with classmates.' },
            { icon: '⚔️', color: 'r', title: 'Real-Time Quiz Battle', desc: 'Live multiplayer quiz battles using a 6-character room code.' },
            { icon: '🌐', color: 'b', title: '8 Indian Languages', desc: 'Full UI in English, Hindi, Tamil, Telugu, Malayalam, Kannada, Marathi and Bengali.' },
            { icon: '👥', color: 'g', title: '3 User Roles', desc: 'Separate dashboards for students, teachers and administrators.' },
          ].map((f, i) => (
            <div key={i} className="feat-card">
              <div className={`feat-icon-box fi-${f.color}`}>{f.icon}</div>
              <div className="feat-title">{f.title}</div>
              <div className="feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className="landing-section about-section" id="about">
        <div className="about-grid">
          <div className="about-left">
            <div className="section-tag">About</div>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: 14 }}>Why SignLearn Pro?</h2>
            <p className="about-desc">
              Existing e-learning platforms are built for hearing users. SignLearn Pro was designed from
              scratch for the 63 million deaf and hard-of-hearing individuals in India — with visual-first
              design at its core.
            </p>
            <ul className="about-list">
              {[
                'No audio dependency — 100% visual instruction and assessment',
                'Purpose-built for India — regional language support across 8 languages',
                'Built on open-source MERN stack — free to use, free to extend',
                'Real-time engagement through quizzes, battles and group chat',
              ].map((item, i) => (
                <li key={i} className="about-item">
                  <div className="about-check">✓</div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="about-cards">
            {[
              { val: '63M+', label: 'Deaf & hard-of-hearing in India', color: '#6C63FF' },
              { val: '8',    label: 'Indian regional languages supported', color: '#43C6AC' },
              { val: '10',   label: 'Gamification levels to unlock', color: '#FFB347' },
              { val: '100%', label: 'Open source — built with MERN', color: '#FF6584' },
            ].map((c, i) => (
              <div key={i} className="about-card">
                <div className="about-card-val" style={{ color: c.color }}>{c.val}</div>
                <div className="about-card-label">{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="landing-section contact-section" id="contact">
        <div className="contact-grid">
          <div className="contact-left">
            <div className="section-tag">Contact</div>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: 10 }}>Get in touch</h2>
            <p className="section-sub" style={{ textAlign: 'left', marginBottom: 28 }}>Have questions? We're here to help.</p>
            <div className="contact-info-list">
              <div className="contact-info-item">
                <div className="contact-info-icon">✉</div>
                <div>
                  <div className="contact-info-label">Email</div>
                  <div className="contact-info-val">support@signlearnpro.in</div>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-info-icon">⏱</div>
                <div>
                  <div className="contact-info-label">Response Time</div>
                  <div className="contact-info-val">Within 24 hours</div>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-info-icon">📍</div>
                <div>
                  <div className="contact-info-label">Location</div>
                  <div className="contact-info-val">Coimbatore, Tamil Nadu, India</div>
                </div>
              </div>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleContact}>
            {status && <div className="contact-success">{status}</div>}
            {error  && <div className="contact-error">{error}</div>}
            <div className="form-row-2">
              <div className="form-field">
                <label>Name</label>
                <input placeholder="Your name" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input type="email" placeholder="your@email.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div className="form-field">
              <label>Subject</label>
              <input placeholder="How can we help?" value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Message</label>
              <textarea rows={4} placeholder="Write your message here..." value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })} required />
            </div>
            <button type="submit" className="contact-submit-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-logo">
          <span className="logo-sign">Sign</span><span className="logo-learn">Learn</span>
        </div>
        <div className="footer-copy">2026 SignLearn Pro. Designed to empower deaf and mute learners across India.</div>
        <div className="footer-links">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Support</span>
        </div>
      </footer>

    </div>
  );
}
