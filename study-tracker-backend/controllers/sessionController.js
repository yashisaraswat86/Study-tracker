const mongoose = require("mongoose");

const StudySession = require("../models/StudySession");
const Subject = require("../models/Subject");
const Goal = require("../models/Goal");
const GoalCompletion = require("../models/GoalCompletion");

const {
  checkAchievements,
} = require("../services/achievementService");

// =====================================
// Start Study Session
// =====================================
const startSession = async (req, res) => {
  try {
    const {
      subject,
      notes = "",
    } = req.body || {};

    // =====================================
    // Validate Subject
    // =====================================
    if (!subject) {
      return res.status(400).json({
        success: false,
        message: "Subject is required",
      });
    }

    // =====================================
    // Validate Subject ID
    // =====================================
    if (!mongoose.Types.ObjectId.isValid(subject)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject ID",
      });
    }

    // =====================================
    // Validate Notes
    // =====================================
    if (
      typeof notes !== "string" ||
      notes.length > 1000
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Notes must be a string with maximum 1000 characters",
      });
    }

    // =====================================
    // Check Subject Ownership
    // =====================================
    const subjectExists = await Subject.findOne({
      _id: subject,
      user: req.user.id,
    });

    if (!subjectExists) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    // =====================================
    // Check Active Session
    // =====================================
    const activeSession = await StudySession.findOne({
      user: req.user.id,
      status: "ongoing",
    });

    if (activeSession) {
      return res.status(400).json({
        success: false,
        message:
          "You already have an active study session",
      });
    }

    // =====================================
    // Create Session
    // =====================================
    const session = await StudySession.create({
      user: req.user.id,
      subject,
      startTime: new Date(),
      notes: notes.trim(),
      status: "ongoing",
    });

    return res.status(201).json({
      success: true,
      message: "Study session started",
      session,
    });

  } catch (error) {
    console.error(
      "Start Session Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// End Study Session
// =====================================
const endSession = async (req, res) => {
  try {
    const {
      notes,
    } = req.body || {};

    // =====================================
    // Validate Notes
    // =====================================
    if (
      notes !== undefined &&
      (
        typeof notes !== "string" ||
        notes.length > 1000
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Notes must be a string with maximum 1000 characters",
      });
    }

    // =====================================
    // Find Active Session
    // =====================================
    const session = await StudySession.findOne({
      user: req.user.id,
      status: "ongoing",
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message:
          "No active study session found",
      });
    }

    // =====================================
    // Set End Time
    // =====================================
    session.endTime = new Date();

    // =====================================
    // Calculate Duration in Seconds
    // =====================================
    session.duration = Math.max(
      Math.floor(
        (
          session.endTime -
          session.startTime
        ) / 1000
      ),
      0
    );

    // =====================================
    // Update Notes
    // =====================================
    if (notes !== undefined) {
      session.notes = notes.trim();
    }

    // =====================================
    // Mark Completed
    // =====================================
    session.status = "completed";

    // =====================================
    // Save Session
    // =====================================
    await session.save();

    // =====================================
    // Check Daily Goal
    // =====================================
    let dailyGoalCompleted = false;
    let dailyGoalProgress = null;

    const dailyGoal = await Goal.findOne({
      user: req.user.id,
      type: "daily",
    });

    if (dailyGoal) {

      // =====================================
      // Today's Date in India
      // =====================================
      const now = new Date();

      const indiaDate =
        new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(now);

      const today = new Date(
        `${indiaDate}T00:00:00+05:30`
      );

      const tomorrow = new Date(today);

      tomorrow.setDate(
        tomorrow.getDate() + 1
      );

      // =====================================
      // Get Today's Study Time
      // =====================================
      const todayStudyResult =
        await StudySession.aggregate([
          {
            $match: {
              user: session.user,
              status: "completed",
              endTime: {
                $gte: today,
                $lt: tomorrow,
              },
            },
          },

          {
            $group: {
              _id: null,
              studyTime: {
                $sum: "$duration",
              },
            },
          },
        ]);

      const studyTime =
        todayStudyResult.length > 0
          ? todayStudyResult[0].studyTime
          : 0;

      // =====================================
      // Goal Progress
      // =====================================
      const remaining = Math.max(
        dailyGoal.target - studyTime,
        0
      );

      const progress =
        dailyGoal.target > 0
          ? Math.min(
              Number(
                (
                  (studyTime /
                    dailyGoal.target) *
                  100
                ).toFixed(2)
              ),
              100
            )
          : 0;

      dailyGoalCompleted =
        studyTime >= dailyGoal.target;

      dailyGoalProgress = {
        target: dailyGoal.target,
        studyTime,
        remaining,
        progress,
        completed: dailyGoalCompleted,
      };

      // =====================================
      // Record Goal Completion
      // =====================================
      if (dailyGoalCompleted) {
        try {
          await GoalCompletion.create({
            user: session.user,
            goal: dailyGoal._id,
            type: "daily",
            date: today,
            target: dailyGoal.target,
            studyTime,
          });

        } catch (error) {

          // Duplicate completion is okay
          if (error.code !== 11000) {
            throw error;
          }
        }
      }
    }

    // =====================================
    // Check Achievements
    // =====================================
    const unlockedAchievements =
      await checkAchievements(
        req.user.id
      );

    // =====================================
    // Populate Subject
    // =====================================
    await session.populate(
      "subject",
      "name color"
    );

    // =====================================
    // Response
    // =====================================
    return res.status(200).json({
      success: true,
      message:
        "Study session ended successfully",
      session,
      dailyGoal: dailyGoalProgress,
      dailyGoalCompleted,
      unlockedAchievements,
    });

  } catch (error) {
    console.error(
      "End Session Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// Get Active Study Session
// =====================================
const getActiveSession = async (req, res) => {
  try {
    const session =
      await StudySession.findOne({
        user: req.user.id,
        status: "ongoing",
      }).populate(
        "subject",
        "name color"
      );

    if (!session) {
      return res.status(404).json({
        success: false,
        message:
          "No active study session found",
      });
    }

    return res.status(200).json({
      success: true,
      session,
    });

  } catch (error) {
    console.error(
      "Get Active Session Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// Get Study Session History
// =====================================
const getSessionHistory = async (req, res) => {
  try {
    const sessions =
      await StudySession.find({
        user: req.user.id,
        status: "completed",
      })
        .populate(
          "subject",
          "name color"
        )
        .sort({
          endTime: -1,
        });

    return res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });

  } catch (error) {
    console.error(
      "Get Session History Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  startSession,
  endSession,
  getActiveSession,
  getSessionHistory,
};