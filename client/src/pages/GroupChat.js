import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import './GroupChat.css';

const ROOMS = [
  { id: 'general', name: '💬 General', desc: 'General discussion' },
  { id: 'lessons', name: '📚 Lessons', desc: 'Discuss lessons' },
  { id: 'quizzes', name: '🎯 Quiz Help', desc: 'Ask quiz questions' },
  { id: 'announcements', name: '📢 Announcements', desc: 'Important updates' },
];

export default function GroupChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [room, setRoom] = useState('general');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(window.location.origin);
    return () => socketRef.current?.disconnect();
  }, []);

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/chat/${room}`).then(r => {
      setMessages(r.data);
      setLoading(false);
    });
    socketRef.current?.emit('join-room', room);
    socketRef.current?.on('receive-message', (data) => {
      if (data.room === room) setMessages(prev => [...prev, data]);
    });
    return () => socketRef.current?.off('receive-message');
  }, [room]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      const { data } = await axios.post('/api/chat', {
        content: input,
        room,
        type: user.role === 'teacher' && room === 'announcements' ? 'announcement' : 'text'
      });
      socketRef.current?.emit('send-message', { ...data, room });
      setMessages(prev => [...prev, data]);
      setInput('');
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const roleColors = { admin: '#FF6584', teacher: '#43C6AC', student: '#6C63FF' };

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <h2>💬 Chat Rooms</h2>
        {ROOMS.map(r => (
          <div
            key={r.id}
            className={`room-item ${room === r.id ? 'active' : ''}`}
            onClick={() => setRoom(r.id)}
          >
            <div className="room-name">{r.name}</div>
            <div className="room-desc">{r.desc}</div>
          </div>
        ))}
      </div>

      <div className="chat-main">
        <div className="chat-header">
          <h2>{ROOMS.find(r => r.id === room)?.name}</h2>
          <p>{ROOMS.find(r => r.id === room)?.desc}</p>
        </div>

        <div className="messages-area">
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : messages.length === 0 ? (
            <div className="empty-chat">
              <div>💬</div>
              <p>No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.sender?._id === user._id || msg.sender === user._id;
              const isAnnouncement = msg.type === 'announcement';
              return (
                <div key={msg._id || i} className={`message ${isMe ? 'my-message' : ''} ${isAnnouncement ? 'announcement' : ''}`}>
                  {!isMe && (
                    <div className="msg-avatar" style={{ background: roleColors[msg.sender?.role] || '#6C63FF' }}>
                      {msg.sender?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="msg-content">
                    {!isMe && (
                      <div className="msg-sender">
                        {msg.sender?.name}
                        <span className="sender-role" style={{ color: roleColors[msg.sender?.role] }}>
                          {msg.sender?.role}
                        </span>
                      </div>
                    )}
                    <div className="msg-bubble">
                      {isAnnouncement && <span className="announcement-tag">📢 Announcement</span>}
                      {msg.content}
                    </div>
                    <div className="msg-time">{formatTime(msg.createdAt)}</div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder={`Message ${ROOMS.find(r => r.id === room)?.name}...`}
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary send-btn" disabled={!input.trim()}>
            Send 📤
          </button>
        </form>
      </div>
    </div>
  );
}