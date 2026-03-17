# 🤝 EduSign - Learning Platform for Deaf and Mute People

A comprehensive, accessible digital learning platform built with the MERN stack, designed specifically for students with hearing and speech disabilities.

## ✨ Features

### For Students
- 📚 **Visual Lessons** — Videos, images, animations, and text content
- 🎯 **Gamified Quizzes** — Interactive quizzes with points and feedback
- ⚔️ **Quiz Battle** — Real-time competitive quizzing via Socket.io
- 🏆 **Leaderboard** — Rankings with levels and points
- 💬 **Group Chat** — Room-based chat with announcements
- 🌐 **Multi-language** — 8 Indian languages supported
- 🌙 **Dark/Light Mode** — Comfortable viewing experience

### For Teachers
- ➕ **Create Lessons** — Add video, image, text, animation content
- 🎯 **Create Quizzes** — Gamified multi-choice questions
- 👥 **Manage Students** — Add students to lessons
- 📊 **Track Progress** — View quiz results and lesson completion
- 📢 **Announcements** — Post updates via group chat

### For Admins
- 👥 Full user management (CRUD)
- 📚 Lesson and quiz oversight
- 🔑 Role-based access control

## 🛠️ Tech Stack
- **Frontend**: React.js, React Router, Socket.io Client
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io
- **Auth**: JWT (JSON Web Tokens)
- **Styling**: Custom CSS with CSS Variables (theme support)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd signlearn-pro
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```

4. **Create uploads directory**
   ```bash
   mkdir -p server/uploads
   ```

5. **Run in development**
   ```bash
   npm run dev
   ```
   This starts both server (port 5000) and client (port 3000)

6. **Or run separately**
   ```bash
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend
   npm run client
   ```

### Production Build
```bash
cd client && npm run build
# Then serve the build/ directory
```

## 📁 Project Structure

```
signlearn-pro/
├── server/
│   ├── index.js          # Express + Socket.io server
│   ├── models/           # MongoDB schemas
│   │   ├── User.js
│   │   ├── Lesson.js
│   │   ├── Quiz.js
│   │   └── Message.js
│   ├── routes/           # API endpoints
│   │   ├── auth.js
│   │   ├── lessons.js
│   │   ├── quizzes.js
│   │   ├── users.js
│   │   ├── chat.js
│   │   └── leaderboard.js
│   ├── middleware/
│   │   └── auth.js       # JWT middleware
│   └── uploads/          # File storage
├── client/
│   └── src/
│       ├── context/      # React Context (Auth, Theme)
│       ├── components/   # Reusable components
│       │   └── layout/   # Sidebar, Topbar
│       └── pages/        # All page components
└── package.json
```

## 🔑 Default Roles
- **admin** — Full platform access
- **teacher** — Create/manage lessons, quizzes, students
- **student** — Access lessons, take quizzes, join battles

## 🌐 Supported Languages
English, हिंदी, தமிழ், తెలుగు, മലയാളം, ಕನ್ನಡ, मराठी, বাংলা

## 🎮 Quiz Battle
Uses Socket.io for real-time multiplayer. Students can:
1. Create a battle room and get a code
2. Share the code with classmates
3. All join and compete simultaneously

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/lessons | Get lessons |
| POST | /api/lessons | Create lesson |
| GET | /api/quizzes | Get quizzes |
| POST | /api/quizzes/:id/submit | Submit quiz |
| GET | /api/leaderboard | Get rankings |
| GET | /api/chat/:room | Get messages |
| POST | /api/chat | Send message |
