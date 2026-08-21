# Study Tracker 📚

A modern and responsive study management application designed to help students
organize their studies, track their study time, manage tasks, create schedules,
set goals, and analyze their overall progress.

---

## 🚀 Overview

Study Tracker provides a centralized platform for managing daily study
activities and monitoring productivity.

Instead of using separate applications for tasks, schedules, study timers,
and progress tracking, Study Tracker brings these features together into one
dashboard.

The application allows users to:

- Manage their subjects
- Create and manage study tasks
- Plan study sessions
- Track actual study time
- Set daily study goals
- Monitor study streaks
- View study analytics
- Track achievements
- Manage their account securely

---

## ✨ Features

### 🔐 Authentication

- User registration
- User login
- User logout
- Protected application routes
- Authentication state management

### 📊 Dashboard

The dashboard provides an overview of the user's current study activity.

It displays:

- Today's study time
- Total study time
- Completed tasks
- Current study streak
- Daily goal progress
- Today's schedule
- Upcoming tasks
- Quick actions

---

### 📚 Subjects

Users can create and manage the subjects they are currently studying.

Each subject can be used throughout the application to organize tasks,
study sessions, and schedules.

---

### ✅ Tasks

The task management system allows users to:

- Create tasks
- Assign tasks to subjects
- Set priorities
- Set deadlines
- Mark tasks as completed
- Edit tasks
- Delete tasks
- Filter tasks by status

Task statistics include:

- Total tasks
- Pending tasks
- Completed tasks
- Overdue tasks

---

### 🗓️ Schedule

Users can plan their study sessions by creating schedules.

The schedule system helps users organize:

- Study dates
- Start times
- End times
- Subjects
- Study activities

The dashboard also displays the relevant schedule for the current day.

---

### ⏱️ Study Timer

The Study Timer allows users to record their actual study time.

Users can:

1. Select a subject
2. Start a study session
3. Track elapsed time
4. Stop/reset the timer
5. Store the study session

Recorded study sessions are integrated with the dashboard and analytics.

---

### 🎯 Goals

Users can create study goals and track their progress toward them.

Daily study targets are reflected throughout the application.

---

### 📈 Analytics

The analytics section provides an overview of study progress.

It includes:

- Total study time
- Today's study time
- Current streak
- Number of subjects
- Daily study goal progress

This helps users understand their study habits and productivity.

---

### 🏆 Achievements

The application includes an achievements section that tracks user
accomplishments and study milestones.

---

## 🛠️ Tech Stack

### Frontend

- React
- JavaScript
- Vite
- CSS
- React Context API

### Development Tools

- Node.js
- npm
- Vite development server

### Application Architecture

The frontend is organized into:

- Pages
- Reusable components
- Authentication context
- Service/API layer
- Utility functions
- Protected routes

---

## 📁 Project Structure

```text
src/
│
├── assets/
│   ├── hero.png
│   ├── react.svg
│   └── vite.svg
│
├── components/
│   ├── ProtectedRoute.jsx
│   │
│   └── layout/
│       ├── MainLayout.jsx
│       └── Sidebar.jsx
│
├── context/
│   └── AuthContext.jsx
│
├── hooks/
│
├── pages/
│   ├── Achievements.jsx
│   ├── Analytics.jsx
│   ├── Dashboard.jsx
│   ├── Goals.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Schedule.jsx
│   ├── StudyTimer.jsx
│   ├── Subjects.jsx
│   └── Tasks.jsx
│
├── services/
│   ├── achievementService.js
│   ├── api.js
│   ├── authService.js
│   ├── dashboardService.js
│   ├── goalService.js
│   ├── scheduleService.js
│   ├── sessionService.js
│   ├── studySessionService.js
│   ├── subjectService.js
│   └── taskService.js
│
├── utils/
│   └── timeFormatter.js
│
├── App.jsx
├── App.css
├── index.css
└── main.jsx
