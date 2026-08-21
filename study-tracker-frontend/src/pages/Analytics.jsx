import { useEffect, useState } from "react";
import { getDashboardOverview } from "../services/dashboardService";
import { getDailyGoal } from "../services/goalService";
import { formatStudyTime } from "../utils/timeFormatter";

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [goal, setGoal] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // LOAD ANALYTICS + DAILY GOAL
  // ============================================

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const [overviewResponse, goalResponse] =
          await Promise.all([
            getDashboardOverview(),
            getDailyGoal(),
          ]);

        console.log(
          "ANALYTICS OVERVIEW RESPONSE:",
          overviewResponse
        );

        console.log(
          "ANALYTICS GOAL RESPONSE:",
          goalResponse
        );

        // Dashboard overview
        if (overviewResponse?.success) {
          setOverview(overviewResponse.data);
        } else {
          setError(
            overviewResponse?.message ||
              "Failed to load analytics"
          );
        }

        // Daily goal
        if (goalResponse?.success) {
          setGoal(goalResponse.data);
        } else {
          setGoal(null);
        }
      } catch (err) {
        console.error(
          "Failed to load analytics:",
          err
        );

        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load analytics"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <span className="eyebrow">
              YOUR PROGRESS
            </span>

            <h1>Analytics</h1>

            <p>
              Loading your study analytics...
            </p>
          </div>
        </div>

        <div className="analytics-section">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR
  // ============================================

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <span className="eyebrow">
              YOUR PROGRESS
            </span>

            <h1>Analytics</h1>

            <p>
              Track your study performance.
            </p>
          </div>
        </div>

        <div className="error-message">
          {error}
        </div>
      </div>
    );
  }

  // ============================================
  // DASHBOARD DATA
  // ============================================

  const summary = overview?.summary || {};
  const streak = overview?.streak || {};

  const totalStudyTime =
    Number(summary.totalStudyTime || 0);

  const todayStudyTime =
    Number(summary.todayStudyTime || 0);

  const totalTasks =
    Number(summary.totalTasks || 0);

  const completedTasks =
    Number(summary.completedTasks || 0);

  const pendingTasks =
    Number(summary.pendingTasks || 0);

  const totalSubjects =
    Number(summary.totalSubjects || 0);

  // ============================================
  // TASK COMPLETION
  // ============================================

  const taskCompletion =
    totalTasks > 0
      ? Math.min(
          Math.round(
            (completedTasks / totalTasks) * 100
          ),
          100
        )
      : 0;

  // ============================================
  // DAILY GOAL DATA
  // Backend stores time in SECONDS
  // ============================================

  const goalSeconds =
    Number(goal?.target || 0);

  const goalProgress =
    Number(goal?.progress || 0);

  const remainingSeconds =
    Number(goal?.remaining || 0);

  // ============================================
  // RETURN
  // ============================================

  return (
    <div className="page-container">

      {/* ========================================= */}
      {/* HEADER */}
      {/* ========================================= */}

      <div className="page-header">
        <div>
          <span className="eyebrow">
            YOUR PROGRESS
          </span>

          <h1>Analytics</h1>

          <p>
            Understand your study habits and
            track your progress.
          </p>
        </div>
      </div>

      {/* ========================================= */}
      {/* OVERVIEW CARDS */}
      {/* ========================================= */}

      <div className="analytics-grid">

        {/* Total Study Time */}

        <div className="analytics-card">

          <div className="analytics-card-header">
            <span>📚</span>
          </div>

          <p className="analytics-label">
            Total Study Time
          </p>

          <h2>
            {formatStudyTime(totalStudyTime)}
          </h2>

          <p className="analytics-description">
            Total time studied
          </p>

        </div>


        {/* Today's Study Time */}

        <div className="analytics-card">

          <div className="analytics-card-header">
            <span>⏱️</span>
          </div>

          <p className="analytics-label">
            Today's Study Time
          </p>

          <h2>
            {formatStudyTime(todayStudyTime)}
          </h2>

          <p className="analytics-description">
            Time studied today
          </p>

        </div>


        {/* Current Streak */}

        <div className="analytics-card">

          <div className="analytics-card-header">
            <span>🔥</span>
          </div>

          <p className="analytics-label">
            Current Streak
          </p>

          <h2>
            {streak.current || 0}
          </h2>

          <p className="analytics-description">
            Best: {streak.longest || 0} days
          </p>

        </div>


        {/* Subjects */}

        <div className="analytics-card">

          <div className="analytics-card-header">
            <span>📖</span>
          </div>

          <p className="analytics-label">
            Subjects
          </p>

          <h2>
            {totalSubjects}
          </h2>

          <p className="analytics-description">
            Total subjects
          </p>

        </div>

      </div>


      {/* ========================================= */}
      {/* DAILY STUDY GOAL */}
      {/* ========================================= */}

      <div className="analytics-section">

        <div className="analytics-section-header">

          <div>

            <span className="eyebrow">
              STUDY PROGRESS
            </span>

            <h2>
              Today's Goal
            </h2>

            <p>
              Track how close you are to your
              daily study target.
            </p>

          </div>

          {goal && (
            <div className="analytics-percentage">
              {goalProgress}%
            </div>
          )}

        </div>


        {goal ? (
          <>

            {/* Progress Bar */}

            <div className="analytics-progress">

              <div
                className="analytics-progress-bar"
                style={{
                  width: `${goalProgress}%`,
                }}
              />

            </div>


            {/* Goal Information */}

            <div className="analytics-progress-info">

              <div>

                <strong>
                  {formatStudyTime(todayStudyTime)}
                </strong>

                <span>
                  Studied today
                </span>

              </div>


              <div>

                <strong>
                  {formatStudyTime(goalSeconds)}
                </strong>

                <span>
                  Daily target
                </span>

              </div>


              <div>

                <strong>
                  {formatStudyTime(remainingSeconds)}
                </strong>

                <span>
                  Remaining
                </span>

              </div>

            </div>

          </>
        ) : (

          <div className="analytics-empty">

            <div className="analytics-empty-icon">
              🎯
            </div>

            <h3>
              No daily goal set
            </h3>

            <p>
              Create a daily study goal to
              start tracking your progress.
            </p>

          </div>

        )}

      </div>


      {/* ========================================= */}
      {/* TASK PERFORMANCE */}
      {/* ========================================= */}

      <div className="analytics-section">

        <div className="analytics-section-header">

          <div>

            <span className="eyebrow">
              TASK PERFORMANCE
            </span>

            <h2>
              Task Completion
            </h2>

            <p>
              See how effectively you're
              completing your tasks.
            </p>

          </div>

          <div className="analytics-percentage">
            {taskCompletion}%
          </div>

        </div>


        {/* Progress Bar */}

        <div className="analytics-progress">

          <div
            className="analytics-progress-bar"
            style={{
              width: `${taskCompletion}%`,
            }}
          />

        </div>


        {/* Task Information */}

        <div className="analytics-progress-info">

          <div>

            <strong>
              {completedTasks}
            </strong>

            <span>
              Completed
            </span>

          </div>


          <div>

            <strong>
              {pendingTasks}
            </strong>

            <span>
              Remaining
            </span>

          </div>


          <div>

            <strong>
              {totalTasks}
            </strong>

            <span>
              Total tasks
            </span>

          </div>

        </div>

      </div>


      {/* ========================================= */}
      {/* STUDY STREAK */}
      {/* ========================================= */}

      <div className="analytics-section">

        <div className="analytics-section-header">

          <div>

            <span className="eyebrow">
              CONSISTENCY
            </span>

            <h2>
              Study Streak
            </h2>

            <p>
              Keep studying consistently to
              build your streak.
            </p>

          </div>

        </div>


        <div className="streak-display">

          {/* Current Streak */}

          <div className="streak-item">

            <span className="streak-icon">
              🔥
            </span>

            <strong>
              {streak.current || 0}
            </strong>

            <span>
              Current streak
            </span>

          </div>


          {/* Longest Streak */}

          <div className="streak-item">

            <span className="streak-icon">
              🏆
            </span>

            <strong>
              {streak.longest || 0}
            </strong>

            <span>
              Longest streak
            </span>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Analytics;