import { useEffect, useState } from "react";

import {
  getDailyGoal,
  setDailyGoal,
} from "../services/goalService";

const Goals = () => {
  const [goal, setGoal] = useState(null);
  const [minutes, setMinutes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================
  // Load Daily Goal
  // ============================================

  useEffect(() => {
    const loadGoal = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getDailyGoal();

        console.log(
          "DAILY GOAL RESPONSE:",
          response
        );

        if (response?.success) {
          setGoal(response.data);
        } else {
          setGoal(null);
        }
      } catch (err) {
        console.error(
          "Failed to load daily goal:",
          err
        );

        // 404 simply means no goal has been created
        if (err.response?.status === 404) {
          setGoal(null);
        } else {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load daily goal"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadGoal();
  }, []);

  // ============================================
  // Create / Update Goal
  // ============================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const goalMinutes = Number(minutes);

    if (!goalMinutes || goalMinutes <= 0) {
      setError(
        "Please enter a valid number of minutes."
      );
      return;
    }

    // Backend stores target in SECONDS
    const targetSeconds =
      goalMinutes * 60;

    try {
      setSaving(true);

      const response =
        await setDailyGoal(
          targetSeconds
        );

      console.log(
        "SET GOAL RESPONSE:",
        response
      );

      if (response?.success) {
        setSuccess(
          response.message ||
            "Daily goal saved successfully."
        );

        // Reload progress from backend
        const updatedGoal =
          await getDailyGoal();

        if (updatedGoal?.success) {
          setGoal(updatedGoal.data);
        }

        setMinutes("");
      } else {
        setError(
          response?.message ||
            "Failed to save goal"
        );
      }
    } catch (err) {
      console.error(
        "Failed to save goal:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save goal"
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // Loading
  // ============================================

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <span className="eyebrow">
              DAILY TARGET
            </span>

            <h1>Goals</h1>

            <p>
              Set a daily study goal and track
              your progress.
            </p>
          </div>
        </div>

        <div className="goal-card">
          <p>Loading your goal...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // Existing Goal Values
  // ============================================

  const targetSeconds =
    Number(goal?.target || 0);

  const studyTimeSeconds =
    Number(goal?.studyTime || 0);

  const remainingSeconds =
    Number(goal?.remaining || 0);

  const progress =
    Number(goal?.progress || 0);

  const completed =
    Boolean(goal?.completed);

  // Convert seconds → minutes for display
  const targetMinutes = Math.floor(
    targetSeconds / 60
  );

  const studyMinutes = Math.floor(
    studyTimeSeconds / 60
  );

  const remainingMinutes = Math.ceil(
    remainingSeconds / 60
  );

  return (
    <div className="page-container">

      {/* ========================================= */}
      {/* HEADER */}
      {/* ========================================= */}

      <div className="page-header">
        <div>
          <span className="eyebrow">
            DAILY TARGET
          </span>

          <h1>Goals</h1>

          <p>
            Set a daily study goal and track
            your progress.
          </p>
        </div>
      </div>

      {/* ========================================= */}
      {/* ERROR */}
      {/* ========================================= */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* ========================================= */}
      {/* SUCCESS */}
      {/* ========================================= */}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {/* ========================================= */}
      {/* NO GOAL */}
      {/* ========================================= */}

      {!goal && (
        <div className="goal-card">

          <div className="goal-card-header">
            <div>
              <span className="goal-icon">
                🎯
              </span>

              <h2>
                Create Your Daily Goal
              </h2>

              <p>
                Decide how much time you want
                to study every day.
              </p>
            </div>
          </div>

          <form
            className="goal-form"
            onSubmit={handleSubmit}
          >

            <div className="goal-input-group">

              <label htmlFor="goalMinutes">
                Daily Study Goal
              </label>

              <div className="goal-input-wrapper">

                <input
                  id="goalMinutes"
                  type="number"
                  min="1"
                  max="1440"
                  placeholder="e.g. 120"
                  value={minutes}
                  onChange={(e) =>
                    setMinutes(
                      e.target.value
                    )
                  }
                />

                <span>
                  minutes
                </span>

              </div>

              <small>
                Set how many minutes you want
                to study each day.
              </small>

            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Creating..."
                : "Create Goal"}
            </button>

          </form>
        </div>
      )}

      {/* ========================================= */}
      {/* EXISTING GOAL */}
      {/* ========================================= */}

      {goal && (
        <>

          {/* Goal Progress Card */}

          <div className="goal-card">

            <div className="goal-summary-top">

              <div>

                <span className="goal-label">
                  TODAY'S GOAL
                </span>

                <h2>
                  {targetMinutes}
                  <span>
                    {" "}minutes
                  </span>
                </h2>

              </div>

              <div className="goal-percentage">
                {progress}%
              </div>

            </div>

            {/* Progress Bar */}

            <div className="goal-progress-container">

              <div className="goal-progress-track">

                <div
                  className="goal-progress-bar"
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>

            </div>

            {/* Progress Information */}

            <div className="goal-progress-info">

              <div>
                <strong>
                  {studyMinutes} min
                </strong>

                <span>
                  Studied today
                </span>
              </div>

              <div>
                <strong>
                  {remainingMinutes} min
                </strong>

                <span>
                  Remaining
                </span>
              </div>

              <div>
                <strong>
                  {completed
                    ? "Completed 🎉"
                    : "Keep going"}
                </strong>

                <span>
                  Today's status
                </span>
              </div>

            </div>

          </div>

          {/* ===================================== */}
          {/* UPDATE GOAL */}
          {/* ===================================== */}

          <div className="goal-card">

            <div className="goal-card-header">

              <span className="goal-label">
                GOAL SETTINGS
              </span>

              <h2>
                Update Daily Goal
              </h2>

              <p>
                Change how many minutes you
                want to study each day.
              </p>

            </div>

            <form
              className="goal-form"
              onSubmit={handleSubmit}
            >

              <div className="goal-input-group">

                <label htmlFor="updateGoalMinutes">
                  Daily Study Goal
                </label>

                <div className="goal-input-wrapper">

                  <input
                    id="updateGoalMinutes"
                    type="number"
                    min="1"
                    max="1440"
                    placeholder={`${targetMinutes}`}
                    value={minutes}
                    onChange={(e) =>
                      setMinutes(
                        e.target.value
                      )
                    }
                  />

                  <span>
                    minutes
                  </span>

                </div>

              </div>

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Updating..."
                  : "Update Goal"}
              </button>

            </form>

          </div>

        </>
      )}

    </div>
  );
};

export default Goals;