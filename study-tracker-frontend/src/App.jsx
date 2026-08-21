import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";


import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/Subjects";
import Tasks from "./pages/Tasks";
import Schedule from "./pages/Schedule";
import StudyTimer from "./pages/StudyTimer";
import Goals from "./pages/Goals";
import Analytics from "./pages/Analytics";
import Achievements from "./pages/Achievements";

import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";

const Placeholder = ({ title }) => {
  return <h1>{title}</h1>;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Protected Application */}

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/subjects"
            element={<Subjects />}
          />

          <Route
            path="/tasks"
            element={<Tasks />}
          />
          <Route
            path="/schedule"
            element={<Schedule />}
          />
          <Route
            path="/timer"
            element={<StudyTimer />}
          />

          <Route
            path="/goals"
            element={<Goals />}
          />

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          <Route
            path="/achievements"
            element={<Achievements />}
          />
        </Route>

        {/* Default */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;