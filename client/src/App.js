import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Lessons from './pages/Lessons';
import LessonDetail from './pages/LessonDetail';
import Quizzes from './pages/Quizzes';
import QuizPlay from './pages/QuizPlay';
import QuizBattle from './pages/QuizBattle';
import Leaderboard from './pages/Leaderboard';
import GroupChat from './pages/GroupChat';
import ManageUsers from './pages/ManageUsers';
import TeacherLessons from './pages/TeacherLessons';
import TeacherQuizzes from './pages/TeacherQuizzes';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
        </Route>
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="lessons" element={<Lessons />} />
          <Route path="lessons/:id" element={<LessonDetail />} />
          <Route path="quizzes" element={<Quizzes />} />
          <Route path="quizzes/:id/play" element={<QuizPlay />} />
          <Route path="quiz-battle" element={<QuizBattle />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="chat" element={<GroupChat />} />
          <Route path="profile" element={<Profile />} />
          <Route path="manage/lessons" element={<ProtectedRoute roles={['teacher','admin']}><TeacherLessons /></ProtectedRoute>} />
          <Route path="manage/quizzes" element={<ProtectedRoute roles={['teacher','admin']}><TeacherQuizzes /></ProtectedRoute>} />
          <Route path="manage/users" element={<ProtectedRoute roles={['teacher','admin']}><ManageUsers /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}