const Goal = require("../models/Goal");
const StudySession = require("../models/StudySession");
const mongoose = require("mongoose");
const GoalCompletion = require("../models/GoalCompletion");

const {
    TIMEZONE
} = require("../utils/dateUtils");


// =====================================
// Create / Update Goal
// =====================================
const setGoal = async (req, res) => {
    try {
        const { type, target } = req.body;

        // Validation
        if (typeof type !== "string" ||
                !["daily", "weekly"].includes(type)
            ) {
            return res.status(400).json({
                success: false,
                message: "Goal type must be either 'daily' or 'weekly'."
            });
        }

        if (
            target === undefined ||
            target === null ||
            typeof target !== "number" ||
            !Number.isFinite(target) ||
            target <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Target must be a positive number."
            });
        }

        let goal = await Goal.findOne({
            user: req.user.id,
            type
        });

        let statusCode = 200;

        if (goal) {
            goal.target = target;
            await goal.save();
        } else {
            goal = await Goal.create({
                user: req.user.id,
                type,
                target
            });

            statusCode = 201;
        }

        return res.status(statusCode).json({
            success: true,
            message:
                statusCode === 201
                    ? "Goal created successfully."
                    : "Goal updated successfully.",
            data: goal
        });

    } catch (error) {

        console.error("Set Goal Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }
};

// =====================================
// Get Daily Goal Progress
// =====================================
const getDailyGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      user: req.user.id,
      type: "daily",
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Daily goal not found.",
      });
    }

    // =====================================
    // Today's Date Range
    // =====================================
    // =====================================
// Get today's date in Asia/Kolkata
// =====================================
const now = new Date();

const indiaDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
}).format(now);

// =====================================
// Create start and end of Indian day
// =====================================
const today = new Date(`${indiaDate}T00:00:00+05:30`);

const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

    // =====================================
    // Convert User ID
    // =====================================
    const userId = new mongoose.Types.ObjectId(
      req.user.id
    );

    // =====================================
    // Calculate Today's Study Time
    // =====================================
    const result = await StudySession.aggregate([
      {
        $match: {
          user: userId,
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
      result.length > 0
        ? result[0].studyTime
        : 0;

    // =====================================
    // Calculate Progress
    // =====================================
    const progress =
      goal.target > 0
        ? Math.min(
            Number(
              (
                (studyTime / goal.target) *
                100
              ).toFixed(2)
            ),
            100
          )
        : 0;

    const remaining = Math.max(
      goal.target - studyTime,
      0
    );

    const completed =
      studyTime >= goal.target;

    // =====================================
    // Record Goal Completion
    // =====================================
    if (completed) {
      try {
        await GoalCompletion.create({
          user: userId,
          goal: goal._id,
          type: "daily",
          date: today,
          target: goal.target,
          studyTime,
        });
      } catch (error) {

        // Duplicate completion is okay
        if (error.code !== 11000) {
          throw error;
        }
      }
    }

    // =====================================
    // Response
    // =====================================
    return res.status(200).json({
      success: true,

      data: {
        target: goal.target,
        studyTime,
        remaining,
        progress,
        completed,
      },
    });

  } catch (error) {
    console.error(
      "Get Daily Goal Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================
// Get Weekly Goal Progress
// =====================================
const getWeeklyGoal = async (req, res) => {
    try {

        const goal = await Goal.findOne({
            user: req.user.id,
            type: "weekly"
        });

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: "Weekly goal not found."
            });
        }

        const now = new Date();

        // =====================================
        // Get current date in India
        // =====================================
        const indiaDate = new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone: TIMEZONE,
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }
        ).format(now);

        const currentDate = new Date(
            `${indiaDate}T00:00:00+05:30`
        );

        // =====================================
        // Find Monday of current week
        // =====================================
        const day = currentDate.getDay();

        const daysFromMonday =
            day === 0 ? 6 : day - 1;

        const weekStart = new Date(currentDate);

        weekStart.setDate(
            weekStart.getDate() -
            daysFromMonday
        );

        const weekEnd = new Date(weekStart);

        weekEnd.setDate(
            weekEnd.getDate() + 7
        );

        // =====================================
        // Convert user ID
        // =====================================
        const userId =
            new mongoose.Types.ObjectId(
                req.user.id
            );

        // =====================================
        // Calculate week's study time
        // =====================================
        const result =
            await StudySession.aggregate([
                {
                    $match: {
                        user: userId,
                        status: "completed",
                        endTime: {
                            $gte: weekStart,
                            $lt: weekEnd
                        }
                    }
                },

                {
                    $group: {
                        _id: null,
                        studyTime: {
                            $sum: "$duration"
                        }
                    }
                }
            ]);

        const studyTime =
            result.length > 0
                ? result[0].studyTime
                : 0;

        // =====================================
        // Calculate progress
        // =====================================
        const progress =
            goal.target > 0
                ? Math.min(
                    Number(
                        (
                            (studyTime /
                                goal.target) *
                            100
                        ).toFixed(2)
                    ),
                    100
                )
                : 0;

        const remaining = Math.max(
            goal.target - studyTime,
            0
        );

        const completed =
            studyTime >= goal.target;

        // =====================================
        // Record weekly completion
        // =====================================
        if (completed) {

            try {

                await GoalCompletion.create({
                    user: userId,
                    goal: goal._id,
                    type: "weekly",
                    date: weekStart,
                    target: goal.target,
                    studyTime
                });

            } catch (error) {

                // Duplicate completion is okay
                if (error.code !== 11000) {
                    throw error;
                }
            }
        }

        return res.status(200).json({

            success: true,

            data: {
                target: goal.target,
                studyTime,
                remaining,
                progress,
                completed,
                weekStart,
                weekEnd
            }

        });

    } catch (error) {

        console.error(
            "Get Weekly Goal Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// =====================================
// Get Goal Completion History
// =====================================
const getGoalHistory = async (req, res) => {
    try {

        const userId = new mongoose.Types.ObjectId(
            req.user.id
        );

        const history = await GoalCompletion.find({
            user: userId,
        })
            .sort({
                date: -1
            })
            .populate(
                "goal",
                "type target"
            );

        return res.status(200).json({
            success: true,
            count: history.length,
            data: history
        });

    } catch (error) {

        console.error(
            "Get Goal History Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// =====================================
// Get Goal Statistics
// =====================================
const getGoalStats = async (req, res) => {
    try {

        const userId =
            new mongoose.Types.ObjectId(
                req.user.id
            );

        // =====================================
        // Get Daily Completions
        // =====================================
        const dailyCompletions =
            await GoalCompletion.find({
                user: userId,
                type: "daily"
            })
            .sort({
                date: 1
            });

        // =====================================
        // Get Weekly Completions
        // =====================================
        const weeklyCompletions =
            await GoalCompletion.find({
                user: userId,
                type: "weekly"
            })
            .sort({
                date: 1
            });

        // =====================================
        // Daily Statistics
        // =====================================
        const dailyTotal =
            dailyCompletions.length;

        let dailyCurrentStreak = 0;
        let dailyLongestStreak = 0;

        if (dailyTotal > 0) {

            const dates = dailyCompletions.map(completion => {
    const dateString = new Intl.DateTimeFormat("en-CA", {
        timeZone: TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date(completion.date));

    return new Date(`${dateString}T00:00:00+05:30`);
});

            let streak = 1;
            dailyLongestStreak = 1;

            for (
                let i = 1;
                i < dates.length;
                i++
            ) {

                const difference =
                    Math.floor(
                        (
                            dates[i] -
                            dates[i - 1]
                        ) /
                        (1000 * 60 * 60 * 24)
                    );

                if (difference === 1) {
                    streak++;
                } else {
                    streak = 1;
                }

                dailyLongestStreak =
                    Math.max(
                        dailyLongestStreak,
                        streak
                    );
            }

            // =====================================
            // Current Daily Streak
            // =====================================

            const todayString = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
}).format(new Date());

const today = new Date(
    `${todayString}T00:00:00+05:30`
);

            const latestDate =
                dates[dates.length - 1];

            const daysFromToday =
                Math.floor(
                    (
                        today -
                        latestDate
                    ) /
                    (1000 * 60 * 60 * 24)
                );

            if (daysFromToday <= 1) {

                dailyCurrentStreak = 1;

                for (
                    let i = dates.length - 1;
                    i > 0;
                    i--
                ) {

                    const difference =
                        Math.floor(
                            (
                                dates[i] -
                                dates[i - 1]
                            ) /
                            (1000 * 60 * 60 * 24)
                        );

                    if (difference === 1) {
                        dailyCurrentStreak++;
                    } else {
                        break;
                    }
                }
            }
        }

        // =====================================
        // Daily Completion Rate
        // =====================================

        let dailyCompletionRate = 0;

        if (dailyTotal > 0) {

            

            const firstDateString = new Intl.DateTimeFormat("en-CA", {
            timeZone: TIMEZONE,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(new Date(dailyCompletions[0].date));

const firstDate = new Date(
    `${firstDateString}T00:00:00+05:30`
);

const todayString = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
}).format(new Date());

const today = new Date(
    `${todayString}T00:00:00+05:30`
);

            const totalDays =
                Math.floor(
                    (
                        today -
                        firstDate
                    ) /
                    (1000 * 60 * 60 * 24)
                ) + 1;

            dailyCompletionRate =
                Math.min(
                    Number(
                        (
                            (
                                dailyTotal /
                                totalDays
                            ) * 100
                        ).toFixed(2)
                    ),
                    100
                );
        }

        // =====================================
        // Weekly Statistics
        // =====================================

        const weeklyTotal =
            weeklyCompletions.length;

        return res.status(200).json({

            success: true,

            data: {

                daily: {
                    totalCompleted:
                        dailyTotal,

                    currentStreak:
                        dailyCurrentStreak,

                    longestStreak:
                        dailyLongestStreak,

                    completionRate:
                        dailyCompletionRate
                },

                weekly: {
                    totalCompleted:
                        weeklyTotal
                }

            }

        });

    } catch (error) {

        console.error(
            "Get Goal Stats Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    setGoal,
    getDailyGoal,
    getWeeklyGoal,
    getGoalHistory,
    getGoalStats
};