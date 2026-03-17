import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { t } from '../utils/translations';
import './Profile.css';

const LEVEL_THRESHOLDS = [0, 50, 150, 300, 500, 800, 1200, 1800, 2600, 3600];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme, language, setLanguage } = useTheme();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const currentLevel = user?.level || 1;
  const points = user?.points || 0;
  const nextLevelPoints = LEVEL_THRESHOLDS[currentLevel] || 9999;
  const prevLevelPoints = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
  const progress = Math.min(100, ((points - prevLevelPoints) / (nextLevelPoints - prevLevelPoints)) * 100);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { data } = await axios.put('/api/auth/settings', { theme, language });
      updateUser(data);
      setMsg(t(language, 'settingsSaved'));
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('❌ Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>👤 {t(language, 'myProfile')}</h1>
        <p>View your progress and customize your experience</p>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <span className="badge badge-primary">{user?.role}</span>

          <div className="level-display">
            <div className="level-badge">
              <span>🎖️</span>
              <div>
                <div className="level-number">{t(language, 'level')} {currentLevel}</div>
                <div className="level-label">{t(language, 'currentLevel')}</div>
              </div>
            </div>
            <div className="xp-info">
              <div className="xp-row">
                <span>⭐ {points} points</span>
                <span>{nextLevelPoints - points} to next</span>
              </div>
              <div className="xp-bar">
                <div className="xp-fill" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>

          <div className="achievement-stats">
            <div className="ach-stat">
              <span className="ach-icon">📚</span>
              <span className="ach-val">{user?.completedLessons?.length || 0}</span>
              <span className="ach-label">{t(language, 'lessonsCompleted')}</span>
            </div>
            <div className="ach-stat">
              <span className="ach-icon">🎯</span>
              <span className="ach-val">{user?.completedQuizzes?.length || 0}</span>
              <span className="ach-label">{t(language, 'quizzesCompleted')}</span>
            </div>
            <div className="ach-stat">
              <span className="ach-icon">⭐</span>
              <span className="ach-val">{points}</span>
              <span className="ach-label">{t(language, 'points')}</span>
            </div>
          </div>
        </div>

        <div className="settings-panel">
          <div className="settings-section">
            <h3>🎨 {t(language, 'appearance')}</h3>
            <div className="setting-item">
              <div>
                <div className="setting-title">{t(language, 'theme')}</div>
                <div className="setting-desc">Switch between light and dark mode</div>
              </div>
              <button className="toggle-btn" onClick={toggleTheme}>
                {theme === 'light' ? `🌙 ${t(language, 'darkMode')}` : `☀️ ${t(language, 'lightMode')}`}
              </button>
            </div>
          </div>

          <div className="settings-section">
            <h3>🌐 {t(language, 'language')}</h3>
            <div className="lang-grid">
              {[
                { code: 'en', label: 'English', flag: '🇬🇧' },
                { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
                { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
                { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
                { code: 'ml', label: 'മലയാളം', flag: '🇮🇳' },
                { code: 'kn', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
                { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
                { code: 'bn', label: 'বাংলা', flag: '🇮🇳' },
              ].map(l => (
                <div
                  key={l.code}
                  className={`lang-option ${language === l.code ? 'selected' : ''}`}
                  onClick={() => setLanguage(l.code)}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {msg && <div className="settings-msg">{msg}</div>}

          <button className="btn btn-primary save-btn" onClick={saveSettings} disabled={saving}>
            {saving ? t(language, 'saving') : `💾 ${t(language, 'saveSettings')}`}
          </button>
        </div>
      </div>
    </div>
  );
}
