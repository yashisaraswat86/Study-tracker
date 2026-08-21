import { useEffect, useState } from "react";

import {
  getAchievements,
  getAchievementProgress,
} from "../services/achievementService";

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [progressData, setProgressData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // LOAD ACHIEVEMENTS
  // ============================================

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          achievementsResponse,
          progressResponse,
        ] = await Promise.all([
          getAchievements(),
          getAchievementProgress(),
        ]);

        console.log(
          "ACHIEVEMENTS RESPONSE:",
          achievementsResponse
        );

        console.log(
          "ACHIEVEMENT PROGRESS RESPONSE:",
          progressResponse
        );

        // ========================================
        // ALL ACHIEVEMENTS
        // ========================================

        if (achievementsResponse?.success) {
          setAchievements(
            achievementsResponse.data || []
          );
        } else {
          setAchievements([]);
        }

        // ========================================
        // ACHIEVEMENT PROGRESS
        // ========================================

        if (progressResponse?.success) {
          setProgressData(
            progressResponse.data || []
          );
        } else {
          setProgressData([]);
        }
      } catch (err) {
        console.error(
          "Failed to load achievements:",
          err
        );

        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load achievements"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAchievements();
  }, []);

  // ============================================
  // FORMAT TIME-BASED ACHIEVEMENTS
  // ============================================

  const formatDuration = (seconds) => {
    if (seconds < 60) {
      return `${seconds} sec`;
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = minutes / 60;

    if (Number.isInteger(hours)) {
      return `${hours} hour${hours !== 1 ? "s" : ""}`;
    }

    return `${hours.toFixed(1)} hours`;
  };

  // ============================================
  // FORMAT ACHIEVEMENT PROGRESS
  // ============================================

  const formatAchievementProgress = (
    current,
    target
  ) => {
    /*
      Time based achievements use seconds.

      Example:
      3600  = 1 hour
      36000 = 10 hours

      Session/streak achievements use normal
      numbers, so they remain:

      2 / 10
      1 / 30
    */

    if (target >= 3600) {
      return `${formatDuration(
        current
      )} / ${formatDuration(target)}`;
    }

    return `${current} / ${target}`;
  };

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <span className="eyebrow">
              YOUR MILESTONES
            </span>

            <h1>Achievements</h1>

            <p>
              Loading your achievements...
            </p>
          </div>
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
              YOUR MILESTONES
            </span>

            <h1>Achievements</h1>

            <p>
              Track the milestones you have
              unlocked.
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
  // SUMMARY
  // ============================================

  const totalAchievements =
    achievements.length;

  const unlockedAchievements =
    achievements.filter(
      (achievement) =>
        achievement.unlocked
    ).length;

  const completion =
    totalAchievements > 0
      ? Math.round(
          (unlockedAchievements /
            totalAchievements) *
            100
        )
      : 0;

  // ============================================
  // RETURN
  // ============================================

  return (
    <div className="page-container">

      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div className="page-header">
        <div>
          <span className="eyebrow">
            YOUR MILESTONES
          </span>

          <h1>Achievements</h1>

          <p>
            Celebrate your progress and keep
            building better study habits.
          </p>
        </div>
      </div>

      {/* ====================================== */}
      {/* SUMMARY CARDS */}
      {/* ====================================== */}

      <div className="achievement-summary">

        {/* Unlocked */}

        <div className="achievement-summary-card">

          <div className="achievement-summary-icon">
            🏆
          </div>

          <div>
            <p className="achievement-summary-label">
              Achievements Unlocked
            </p>

            <h2>
              {unlockedAchievements} /{" "}
              {totalAchievements}
            </h2>
          </div>

        </div>

        {/* Completion */}

        <div className="achievement-summary-card">

          <div className="achievement-summary-icon">
            ⭐
          </div>

          <div>
            <p className="achievement-summary-label">
              Completion
            </p>

            <h2>
              {completion}%
            </h2>
          </div>

        </div>

      </div>

      {/* ====================================== */}
      {/* OVERALL PROGRESS */}
      {/* ====================================== */}

      <div className="achievement-progress-card">

        <div className="achievement-progress-header">

          <div>
            <span className="eyebrow">
              YOUR PROGRESS
            </span>

            <h2>
              Achievement Progress
            </h2>

            <p>
              Keep studying to unlock more
              achievements.
            </p>
          </div>

          <strong>
            {completion}%
          </strong>

        </div>

        <div className="achievement-progress">

          <div
            className="achievement-progress-bar"
            style={{
              width: `${completion}%`,
            }}
          />

        </div>

      </div>

      {/* ====================================== */}
      {/* ALL ACHIEVEMENTS */}
      {/* ====================================== */}

      <div className="achievement-section">

        <div className="achievement-section-header">

          <div>
            <span className="eyebrow">
              MILESTONES
            </span>

            <h2>
              All Achievements
            </h2>

            <p>
              Complete study milestones to
              unlock these rewards.
            </p>
          </div>

        </div>

        {/* ==================================== */}
        {/* EMPTY STATE */}
        {/* ==================================== */}

        {achievements.length === 0 ? (
          <div className="achievement-empty">

            <div className="achievement-empty-icon">
              🏆
            </div>

            <h3>
              No achievements found
            </h3>

            <p>
              Your achievements will appear
              here once they are available.
            </p>

          </div>
        ) : (

          /* ================================== */
          /* ACHIEVEMENT GRID */
          /* ================================== */

          <div className="achievement-grid">

            {achievements.map(
              (achievement) => {

                // --------------------------------
                // FIND PROGRESS DATA
                // --------------------------------

                const progress =
                  progressData.find(
                    (item) =>
                      String(item._id) ===
                      String(
                        achievement._id
                      )
                  );

                // --------------------------------
                // CURRENT PROGRESS
                // --------------------------------

                const current =
                  progress?.current ??
                  achievement.progress ??
                  0;

                // --------------------------------
                // TARGET
                // --------------------------------

                const target =
                  achievement.target || 1;

                // --------------------------------
                // PERCENTAGE
                // --------------------------------

                const rawPercentage =
                  progress?.percentage ??
                  (target > 0
                    ? (current / target) *
                      100
                    : 0);

                const percentage =
                  Math.min(
                    Number(rawPercentage),
                    100
                  );

                // --------------------------------
                // UNLOCKED
                // --------------------------------

                const unlocked =
                  achievement.unlocked ||
                  progress?.completed ||
                  false;

                // --------------------------------
                // CLEAN DISPLAY PERCENTAGE
                // --------------------------------

                const displayPercentage =
                  percentage < 1
                    ? percentage.toFixed(2)
                    : Math.round(
                        percentage
                      );

                // --------------------------------
                // DISPLAY PROGRESS
                // --------------------------------

                const displayProgress =
                  formatAchievementProgress(
                    current,
                    target
                  );

                return (
                  <div
                    key={achievement._id}
                    className={`achievement-card ${
                      unlocked
                        ? "achievement-unlocked"
                        : "achievement-locked"
                    }`}
                  >

                    {/* ========================== */}
                    {/* ICON */}
                    {/* ========================== */}

                    <div className="achievement-icon">
                      {achievement.icon ||
                        (unlocked
                          ? "🏆"
                          : "🔒")}
                    </div>

                    {/* ========================== */}
                    {/* CONTENT */}
                    {/* ========================== */}

                    <div className="achievement-content">

                      {/* TITLE */}

                      <div className="achievement-title-row">

                        <h3>
                          {achievement.name}
                        </h3>

                        {unlocked && (
                          <span className="achievement-badge">
                            Unlocked
                          </span>
                        )}

                      </div>

                      {/* DESCRIPTION */}

                      <p>
                        {
                          achievement.description
                        }
                      </p>

                      {/* ====================== */}
                      {/* LOCKED PROGRESS */}
                      {/* ====================== */}

                      {!unlocked && (
                        <>

                          {/* Progress bar */}

                          <div className="achievement-mini-progress">

                            <div
                              className="achievement-mini-progress-bar"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />

                          </div>

                          {/* Progress text */}

                          <div className="achievement-progress-text">

                            <span>
                              {displayProgress}
                            </span>

                            <span>
                              {displayPercentage}%
                            </span>

                          </div>

                          {/* Status */}

                          <div className="achievement-status">
                            🔒 Keep studying to
                            unlock
                          </div>

                        </>
                      )}

                      {/* ====================== */}
                      {/* UNLOCKED STATUS */}
                      {/* ====================== */}

                      {unlocked && (
                        <div className="achievement-status">
                          ✓ Achievement unlocked
                        </div>
                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>

    </div>
  );
};

export default Achievements;