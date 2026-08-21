const mongoose = require("mongoose");

const Achievement = require("../models/Achievement");
const UserAchievement = require("../models/UserAchievement");
const StudySession = require("../models/StudySession");
const GoalCompletion = require("../models/GoalCompletion");

const {
    TIMEZONE
} = require("../utils/dateUtils");

// =====================================
// Check & Unlock User Achievements
// =====================================
const checkAchievements = async (userId) => {
    try {
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // =====================================
        // Get all achievements
        // =====================================
        const achievements = await Achievement.find();

        if (!achievements.length) {
            return [];
        }

        // =====================================
        // Total completed sessions
        // =====================================
        const totalSessions = await StudySession.countDocuments({
            user: userObjectId,
            status: "completed"
        });

        // =====================================
        // Total study time
        // =====================================
        const studyTimeResult = await StudySession.aggregate([
            {
                $match: {
                    user: userObjectId,
                    status: "completed"
                }
            },
            {
                $group: {
                    _id: null,
                    totalStudyTime: {
                        $sum: "$duration"
                    }
                }
            }
        ]);

        const totalStudyTime =
            studyTimeResult.length > 0
                ? studyTimeResult[0].totalStudyTime
                : 0;

        // =====================================
        // Current streak
        // =====================================
        const currentStreak =
            await calculateCurrentStreak(userObjectId);

        // =====================================
        // Daily Goal Completions
        // =====================================
        const dailyGoalCompletions =
            await GoalCompletion.countDocuments({
                user: userObjectId,
                type: "daily"
            });

        // =====================================
        // Weekly Goal Completions
        // =====================================
        const weeklyGoalCompletions =
            await GoalCompletion.countDocuments({
                user: userObjectId,
                type: "weekly"
            });

        const unlockedAchievements = [];

        // =====================================
        // Check every achievement
        // =====================================
        for (const achievement of achievements) {

            let progress = 0;

            switch (achievement.type) {

                // ---------------------------------
                // First Session
                // ---------------------------------
                case "first_session":
                    progress = totalSessions;
                    break;

                // ---------------------------------
                // Study Time
                // ---------------------------------
                case "study_time":
                    progress = totalStudyTime;
                    break;

                // ---------------------------------
                // Sessions
                // ---------------------------------
                case "sessions":
                    progress = totalSessions;
                    break;

                // ---------------------------------
                // Streak
                // ---------------------------------
                case "streak":
                    progress = currentStreak;
                    break;

                // ---------------------------------
                // Daily Goal
                // ---------------------------------
                case "daily_goal":
                    progress = dailyGoalCompletions;
                    break;

                // ---------------------------------
                // Weekly Goal
                // ---------------------------------
                case "weekly_goal":
                    progress = weeklyGoalCompletions;
                    break;

                // ---------------------------------
                // Unknown Achievement Type
                // ---------------------------------
                default:
                    progress = 0;
            }

            // =====================================
            // Check existing user achievement
            // =====================================
            let userAchievement =
                await UserAchievement.findOne({
                    user: userObjectId,
                    achievement: achievement._id
                });

            // =====================================
            // Create if it doesn't exist
            // =====================================
            if (!userAchievement) {

                userAchievement =
                    await UserAchievement.create({
                        user: userObjectId,
                        achievement: achievement._id,
                        progress: Math.min(
                            progress,
                            achievement.target
                        ),
                        unlocked: false
                    });

            } else if (!userAchievement.unlocked) {

                userAchievement.progress =
                    Math.min(
                        progress,
                        achievement.target
                    );

                await userAchievement.save();
            }

            // =====================================
            // Unlock achievement
            // =====================================
            if (
                !userAchievement.unlocked &&
                progress >= achievement.target
            ) {

                userAchievement.unlocked = true;

                userAchievement.unlockedAt =
                    new Date();

                userAchievement.progress =
                    achievement.target;

                await userAchievement.save();

                unlockedAchievements.push(
                    achievement
                );
            }
        }

        return unlockedAchievements;

    } catch (error) {

        console.error(
            "Achievement Service Error:",
            error
        );

        return [];
    }
};


// =====================================
// Calculate Current Study Streak
// =====================================
const calculateCurrentStreak = async (userId) => {

    const sessions = await StudySession.aggregate([

        {
            $match: {
                user: userId,
                status: "completed",
                endTime: {
                    $ne: null
                }
            }
        },

        {
            $project: {
                date: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$endTime",
                        timezone: TIMEZONE
                    }
                }
            }
        },

        {
            $group: {
                _id: "$date"
            }
        },

        {
            $sort: {
                _id: -1
            }
        }

    ]);

    if (!sessions.length) {
        return 0;
    }

    // Dates are YYYY-MM-DD strings
    const dates = sessions.map(
        session => new Date(`${session._id}T00:00:00`)
    );

    // =====================================
    // Get today's date in India
    // =====================================
    const todayString = new Intl.DateTimeFormat(
        "en-CA",
        {
            timeZone: TIMEZONE,
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }
    ).format(new Date());

    const today = new Date(
        `${todayString}T00:00:00`
    );

    // =====================================
    // Latest study date
    // =====================================
    const latestDate = dates[0];

    const differenceFromToday = Math.floor(
        (today - latestDate) /
        (1000 * 60 * 60 * 24)
    );

    // User didn't study today or yesterday
    if (differenceFromToday > 1) {
        return 0;
    }

    // =====================================
    // Calculate streak
    // =====================================
    let streak = 1;

    for (let i = 1; i < dates.length; i++) {

        const previous = dates[i - 1];
        const current = dates[i];

        const difference = Math.floor(
            (previous - current) /
            (1000 * 60 * 60 * 24)
        );

        if (difference === 1) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
};


module.exports = {
    checkAchievements,
    calculateCurrentStreak
};