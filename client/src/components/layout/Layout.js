import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { t } from '../../utils/translations';
import './Layout.css';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'mr', label: 'मराठी' },
  { code: 'bn', label: 'বাংলা' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, language, setLanguage } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = {
    student: [
      { to: '/dashboard', icon: '🏠', key: 'dashboard' },
      { to: '/lessons', icon: '📚', key: 'lessons' },
      { to: '/quizzes', icon: '🎯', key: 'quizzes' },
      { to: '/quiz-battle', icon: '⚔️', key: 'quizBattle' },
      { to: '/leaderboard', icon: '🏆', key: 'leaderboard' },
      { to: '/chat', icon: '💬', key: 'groupChat' },
    ],
    teacher: [
      { to: '/dashboard', icon: '🏠', key: 'dashboard' },
      { to: '/manage/lessons', icon: '📚', key: 'myLessons' },
      { to: '/manage/quizzes', icon: '🎯', key: 'myQuizzes' },
      { to: '/manage/users', icon: '👥', key: 'students' },
      { to: '/leaderboard', icon: '🏆', key: 'leaderboard' },
      { to: '/chat', icon: '💬', key: 'groupChat' },
    ],
    admin: [
      { to: '/dashboard', icon: '🏠', key: 'dashboard' },
      { to: '/manage/lessons', icon: '📚', key: 'lessons' },
      { to: '/manage/quizzes', icon: '🎯', key: 'quizzes' },
      { to: '/manage/users', icon: '👥', key: 'allUsers' },
      { to: '/leaderboard', icon: '🏆', key: 'leaderboard' },
      { to: '/chat', icon: '💬', key: 'groupChat' },
    ]
  };

  const items = navItems[user?.role] || navItems.student;
  const roleColors = { admin: '#FF6584', teacher: '#43C6AC', student: '#6C63FF' };

  return (
    <div className={`layout ${theme}`}>
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon-box">
              <svg width="20" height="20" viewBox="0 0 20 20">
                <rect x="2" y="11" width="7" height="7" rx="1.5" fill="white" opacity="0.95"/>
                <rect x="11" y="11" width="7" height="7" rx="1.5" fill="white" opacity="0.6"/>
                <circle cx="10" cy="10" r="1.6" fill="#43C6AC"/>
                <path d="M5 8 Q10 5 15 8" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                <path d="M2 5 Q10 1.5 18 5" fill="none" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
              </svg>
            </div>
            <div className="logo-text-wrap">
              <div><span className="logo-sign">Sign</span><span className="logo-learn">Learn</span></div>
              <div className="logo-tag">LEARN WITHOUT LIMITS</div>
            </div>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        <div className="user-card">
          <div className="user-avatar" style={{ background: roleColors[user?.role] }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-role badge badge-primary">{user?.role}</div>
          </div>
        </div>

        <div className="user-stats">
          <div className="stat-pill">⭐ {user?.points || 0} pts</div>
          <div className="stat-pill">🎖️ Lv.{user?.level || 1}</div>
        </div>

        <nav className="nav-menu">
          {items.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{t(language, item.key)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="theme-toggle" onClick={toggleTheme}>
            <span>{theme === 'light' ? '🌙' : '☀️'}</span>
            <span>{theme === 'light' ? t(language, 'darkMode') : t(language, 'lightMode')}</span>
          </div>

          <select
            className="lang-select"
            value={language}
            onChange={e => setLanguage(e.target.value)}
          >
            {languages.map(l => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>

          <button className="nav-item logout" onClick={() => { logout(); navigate('/'); }}>
            <span className="nav-icon">🚪</span>
            <span className="nav-label">{t(language, 'logout')}</span>
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="topbar-right">
            <NavLink to="/profile" className="profile-link">
              <div className="avatar-sm">{user?.name?.[0]?.toUpperCase()}</div>
              <span>{user?.name}</span>
            </NavLink>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}