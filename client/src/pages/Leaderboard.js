import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Leaderboard.css';

export default function Leaderboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/leaderboard').then(r => { setStudents(r.data); setLoading(false); });
  }, []);

  const myRank = students.findIndex(s => s._id === user._id) + 1;

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const top3 = students.slice(0, 3);
  const rest = students.slice(3);

  return (
    <div>
      <div className="page-header">
        <h1>🏆 Leaderboard</h1>
        <p>Top performing students - keep learning and climb the ranks!</p>
      </div>

      {myRank > 0 && (
        <div className="my-rank-banner">
          🎖️ Your Current Rank: <strong>#{myRank}</strong> with <strong>⭐ {user?.points || 0} points</strong>
        </div>
      )}

      <div className="podium">
        {top3[1] && (
          <div className="podium-slot silver">
            <div className="podium-avatar">{top3[1].name?.[0]?.toUpperCase()}</div>
            <div className="podium-name">{top3[1].name}</div>
            <div className="podium-pts">⭐ {top3[1].points}</div>
            <div className="podium-block" style={{ height: 100 }}>🥈</div>
          </div>
        )}
        {top3[0] && (
          <div className="podium-slot gold">
            <div className="crown">👑</div>
            <div className="podium-avatar gold-av">{top3[0].name?.[0]?.toUpperCase()}</div>
            <div className="podium-name">{top3[0].name}</div>
            <div className="podium-pts">⭐ {top3[0].points}</div>
            <div className="podium-block" style={{ height: 130 }}>🥇</div>
          </div>
        )}
        {top3[2] && (
          <div className="podium-slot bronze">
            <div className="podium-avatar">{top3[2].name?.[0]?.toUpperCase()}</div>
            <div className="podium-name">{top3[2].name}</div>
            <div className="podium-pts">⭐ {top3[2].points}</div>
            <div className="podium-block" style={{ height: 80 }}>🥉</div>
          </div>
        )}
      </div>

      <div className="leaderboard-table">
        <div className="table-header">
          <span>#</span>
          <span>Student</span>
          <span>Level</span>
          <span>Lessons</span>
          <span>Quizzes</span>
          <span>Points</span>
        </div>
        {rest.map((student, i) => (
          <div key={student._id} className={`table-row ${student._id === user._id ? 'my-row' : ''}`}>
            <span className="rank-num">#{i + 4}</span>
            <div className="student-cell">
              <div className="student-av">{student.name?.[0]?.toUpperCase()}</div>
              <div>
                <div className="student-name">{student.name}</div>
                {student._id === user._id && <span className="you-badge">You</span>}
              </div>
            </div>
            <span className="level-chip">Lv.{student.level || 1}</span>
            <span className="number-cell">{student.completedLessons?.length || 0}</span>
            <span className="number-cell">{student.completedQuizzes?.length || 0}</span>
            <span className="points-cell">⭐ {student.points || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
