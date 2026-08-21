import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import { getTodaySchedule } from "../services/scheduleService";
import {
  getDashboardOverview,
  getUpcomingTasks,
} from "../services/dashboardService";

// --------------------------------------------------
// Format study time
// --------------------------------------------------
const formatStudyTime = (seconds = 0) => {
  const totalSeconds = Number(seconds) || 0;

  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    if (minutes > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${hours}h`;
  }

  return `${minutes}m`;
};

// --------------------------------------------------
// Format goal target
// --------------------------------------------------
const formatGoalTarget = (seconds = 0) => {
  const totalSeconds = Number(seconds) || 0;

  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    if (minutes > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${hours}h`;
  }

  return `${minutes}m`;
};

// --------------------------------------------------
// Format task date
// --------------------------------------------------
const formatTaskDate = (date) => {
  if (!date) {
    return "No due date";
  }

  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
};

// --------------------------------------------------
// Dynamic greeting
// --------------------------------------------------
const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good morning 👋";
  }

  if (hour >= 12 && hour < 17) {
    return "Good afternoon 👋";
  }

  if (hour >= 17 && hour < 21) {
    return "Good evening 👋";
  }

  return "Good night 🌙";
};

// --------------------------------------------------
// Normalize schedule response
// --------------------------------------------------
const extractSchedules = (response) => {
  if (!response) {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data?.schedules)) {
    return response.data.schedules;
  }

  if (Array.isArray(response.schedules)) {
    return response.schedules;
  }

  if (Array.isArray(response.data?.data)) {
    return response.data.data;
  }

  return [];
};

// --------------------------------------------------
// Dashboard
// --------------------------------------------------
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ------------------------------------------------
  // Load dashboard data
  // ------------------------------------------------
  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      // Run all API requests independently.
      // This prevents one optional section from
      // breaking the complete dashboard.
      const results = await Promise.allSettled([
        getDashboardOverview(),
        getUpcomingTasks(),
        getTodaySchedule(),
      ]);

      const overviewResult = results[0];
      const tasksResult = results[1];
      const scheduleResult = results[2];

      // --------------------------------------------
      // Dashboard overview
      // --------------------------------------------
      if (
        overviewResult.status === "fulfilled" &&
        overviewResult.value?.success
      ) {
        setOverview(overviewResult.value.data);
      } else {
        const message =
          overviewResult.status === "fulfilled"
            ? overviewResult.value?.message
            : overviewResult.reason?.response?.data?.message ||
              overviewResult.reason?.message;

        throw new Error(
          message || "Failed to load dashboard overview."
        );
      }

      // --------------------------------------------
      // Upcoming tasks
      // --------------------------------------------
      if (
        tasksResult.status === "fulfilled" &&
        tasksResult.value?.success
      ) {
        setUpcomingTasks(tasksResult.value.data || []);
      } else {
        console.error(
          "Upcoming tasks failed:",
          tasksResult.reason || tasksResult.value
        );

        // Keep dashboard usable even if tasks fail.
        setUpcomingTasks([]);
      }

      // --------------------------------------------
      // Today's schedule
      // --------------------------------------------
      if (scheduleResult.status === "fulfilled") {
        const schedules = extractSchedules(
          scheduleResult.value
        );

        setTodaySchedule(schedules);
      } else {
        console.error(
          "Today's schedule failed:",
          scheduleResult.reason
        );

        // Keep dashboard usable even if schedule fails.
        setTodaySchedule([]);
      }
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong while loading the dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------
  // Initial load
  // ------------------------------------------------
  useEffect(() => {
    loadDashboard();
  }, []);

  // ------------------------------------------------
  // Loading state
  // ------------------------------------------------
  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>

          <h2>Loading dashboard...</h2>

          <p>
            Please wait while we load your study data.
          </p>
        </div>
      </div>
    );
  }

  // ------------------------------------------------
  // Error state
  // ------------------------------------------------
  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-error">
          <div className="dashboard-error-icon">
            !
          </div>

          <h2>Unable to load dashboard</h2>

          <p>{error}</p>

          <button
            className="retry-button"
            onClick={loadDashboard}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------
  // Backend data
  // ------------------------------------------------
  const summary = overview?.summary || {};
  const goal = overview?.goal;

  const streak = overview?.streak || {
    current: 0,
    longest: 0,
  };

  const todayStudyTime =
    Number(summary.todayStudyTime) || 0;

  const totalStudyTime =
    Number(summary.totalStudyTime) || 0;

  const completedTasks =
    Number(summary.completedTasks) || 0;

  const totalTasks =
    Number(summary.totalTasks) || 0;

  const pendingTasks =
    Number(summary.pendingTasks) || 0;

  // ------------------------------------------------
  // Goal calculations
  // ------------------------------------------------
  let goalTargetSeconds = 0;

  if (goal) {
    if (goal.targetSeconds != null) {
      goalTargetSeconds =
        Number(goal.targetSeconds) || 0;
    } else if (goal.targetMinutes != null) {
      goalTargetSeconds =
        (Number(goal.targetMinutes) || 0) * 60;
    } else if (goal.target != null) {
      goalTargetSeconds =
        Number(goal.target) || 0;
    }
  }

  const goalProgress =
    goalTargetSeconds > 0
      ? Math.min(
          Math.round(
            (todayStudyTime / goalTargetSeconds) *
              10000
          ) / 100,
          100
        )
      : 0;

  // ------------------------------------------------
  // Render
  // ------------------------------------------------
  return (
    <div className="dashboard">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="dashboard-header">

        <div>
          <p className="dashboard-greeting">
            {getGreeting()}
          </p>

          <h1>
            Welcome back, {user?.name}
          </h1>

          <p className="dashboard-subtitle">
            Here's what's happening with your
            studies today.
          </p>
        </div>

        <div className="dashboard-date">
          <span>Today</span>

          <strong>
            {new Date().toLocaleDateString(
              "en-US",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              }
            )}
          </strong>
        </div>

      </div>

      {/* ==========================================
          STATISTICS
      ========================================== */}

      <div className="stats-grid">

        {/* Today's Study Time */}
        <div className="stat-card">

          <div className="stat-card-top">
            <span className="stat-title">
              Today's Study Time
            </span>

            <span className="stat-icon">
              ◷
            </span>
          </div>

          <h2>
            {formatStudyTime(todayStudyTime)}
          </h2>

          <p className="stat-positive">
            Total:{" "}
            {formatStudyTime(totalStudyTime)}
          </p>

        </div>

        {/* Tasks */}
        <div className="stat-card">

          <div className="stat-card-top">
            <span className="stat-title">
              Tasks Completed
            </span>

            <span className="stat-icon">
              ✓
            </span>
          </div>

          <h2>
            {completedTasks} / {totalTasks}
          </h2>

          <p className="stat-positive">
            {pendingTasks}{" "}
            {pendingTasks === 1
              ? "task"
              : "tasks"}{" "}
            remaining
          </p>

        </div>

        {/* Streak */}
        <div className="stat-card">

          <div className="stat-card-top">
            <span className="stat-title">
              Current Streak
            </span>

            <span className="stat-icon">
              🔥
            </span>
          </div>

          <h2>
            {streak.current || 0}{" "}
            {streak.current === 1
              ? "day"
              : "days"}
          </h2>

          <p className="stat-positive">
            Best: {streak.longest || 0}{" "}
            {streak.longest === 1
              ? "day"
              : "days"}
          </p>

        </div>

        {/* Daily Goal */}
        <div className="stat-card">

          <div className="stat-card-top">
            <span className="stat-title">
              Daily Goal
            </span>

            <span className="stat-icon">
              ◎
            </span>
          </div>

          {goal ? (
            <>
              <h2>{goalProgress}%</h2>

              <p className="stat-positive">
                {formatStudyTime(todayStudyTime)}
                {" / "}
                {formatGoalTarget(
                  goalTargetSeconds
                )}
              </p>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${goalProgress}%`,
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <h2>Not set</h2>

              <p className="stat-positive">
                Create a daily goal to
                track progress
              </p>
            </>
          )}

        </div>

      </div>

      {/* ==========================================
          MAIN GRID
      ========================================== */}

      <div className="dashboard-grid">

        {/* ========================================
            TODAY'S SCHEDULE
        ======================================== */}

        <section className="dashboard-card schedule-card">

          <div className="card-header">

            <div>
              <h2>
                Today's Schedule
              </h2>

              <p>
                Your planned activities
                for today
              </p>
            </div>

            <button
              className="view-button"
              onClick={() =>
                navigate("/schedule")
              }
            >
              View all
            </button>

          </div>

          <div className="schedule-list">

            {todaySchedule.length === 0 ? (

              <div className="schedule-empty">

                <div className="schedule-empty-icon">
                  ◷
                </div>

                <h3>
                  No study sessions planned
                </h3>

                <p>
                  Plan your study time to
                  stay on track.
                </p>

                <button
                  className="view-button"
                  onClick={() =>
                    navigate("/schedule")
                  }
                >
                  Add Schedule
                </button>

              </div>

            ) : (

              todaySchedule.map(
                (schedule) => (

                  <div
                    className="schedule-item"
                    key={
                      schedule._id ||
                      schedule.id
                    }
                  >

                    <div className="schedule-time">
                      <strong>
                        {schedule.startTime}
                      </strong>

                      <span>
                        {schedule.endTime}
                      </span>
                    </div>

                    <div className="schedule-info">

                      <h3>
                        {schedule.title ||
                          schedule.name ||
                          "Study Session"}
                      </h3>

                      {schedule.description && (
                        <p className="schedule-description">
                          {schedule.description}
                        </p>
                      )}

                      {schedule.subject && (
                        <div className="schedule-subject">
                          {schedule.subject?.name ||
                            schedule.subject}
                        </div>
                      )}

                    </div>

                  </div>
                )
              )

            )}

          </div>

        </section>

        {/* ========================================
            UPCOMING TASKS
        ======================================== */}

        <section className="dashboard-card tasks-card">

          <div className="card-header">

            <div>
              <h2>
                Upcoming Tasks
              </h2>

              <p>
                Don't miss your deadlines
              </p>
            </div>

            <button
              className="view-button"
              onClick={() =>
                navigate("/tasks")
              }
            >
              View all
            </button>

          </div>

          <div className="task-list">

            {upcomingTasks.length === 0 ? (

              <div className="task-empty">

                <div className="schedule-empty-icon">
                  ✓
                </div>

                <h3>
                  No upcoming tasks
                </h3>

                <p>
                  You're all caught up 🎉
                </p>

                <button
                  className="view-button"
                  onClick={() =>
                    navigate("/tasks")
                  }
                >
                  View Tasks
                </button>

              </div>

            ) : (

              upcomingTasks.map((task) => (

                <div
                  className="task-item"
                  key={
                    task._id ||
                    task.id
                  }
                >

                  <div className="task-checkbox" />

                  <div className="task-info">

                    <h3>
                      {task.title}
                    </h3>

                    <span>
                      {formatTaskDate(
                        task.dueDate
                      )}
                    </span>

                  </div>

                </div>

              ))

            )}

          </div>

        </section>

      </div>

      {/* ==========================================
          QUICK ACTIONS
      ========================================== */}

      <section className="quick-actions">

        <h2>
          Quick Actions
        </h2>

        <div className="actions-grid">

          {/* Start Study Session */}
          <button
            className="action-card"
            onClick={() =>
              navigate("/timer")
            }
          >
            <span className="action-icon">
              ▶
            </span>

            <div>
              <strong>
                Start Study Session
              </strong>

              <span>
                Focus on your next subject
              </span>
            </div>
          </button>

          {/* Add Task */}
          <button
            className="action-card"
            onClick={() =>
              navigate("/tasks")
            }
          >
            <span className="action-icon">
              +
            </span>

            <div>
              <strong>
                Add New Task
              </strong>

              <span>
                Create a task or assignment
              </span>
            </div>
          </button>

          {/* Create Goal */}
          <button
            className="action-card"
            onClick={() =>
              navigate("/goals")
            }
          >
            <span className="action-icon">
              ◎
            </span>

            <div>
              <strong>
                Create Goal
              </strong>

              <span>
                Set a new study goal
              </span>
            </div>
          </button>

        </div>

      </section>

    </div>
  );
};

export default Dashboard;