const Achievement = require("../models/Achievement");

const achievements = [
    {
        name: "First Step",
        description: "Complete your first study session",
        icon: "🎯",
        type: "first_session",
        target: 1
    },

    {
        name: "1 Hour Scholar",
        description: "Study for a total of 1 hour",
        icon: "📚",
        type: "study_time",
        target: 3600
    },

    {
        name: "10 Hour Scholar",
        description: "Study for a total of 10 hours",
        icon: "📚",
        type: "study_time",
        target: 36000
    },

    {
        name: "7 Day Streak",
        description: "Study for 7 consecutive days",
        icon: "🔥",
        type: "streak",
        target: 7
    },

    {
        name: "30 Day Streak",
        description: "Study for 30 consecutive days",
        icon: "🔥",
        type: "streak",
        target: 30
    },

    {
        name: "10 Sessions",
        description: "Complete 10 study sessions",
        icon: "⏱️",
        type: "sessions",
        target: 10
    },

    {
        name: "50 Sessions",
        description: "Complete 50 study sessions",
        icon: "⏱️",
        type: "sessions",
        target: 50
    },

    {
        name: "Goal Crusher",
        description: "Complete your daily goal 7 times",
        icon: "🎯",
        type: "daily_goal",
        target: 7
    },

    {
        name: "Consistency Master",
        description: "Complete your daily goal 30 times",
        icon: "🏆",
        type: "daily_goal",
        target: 30
    }
];

const seedAchievements = async () => {
    try {
        for (const achievement of achievements) {

            await Achievement.findOneAndUpdate(
                {
                    name: achievement.name
                },
                achievement,
                {
                    upsert: true,
                    returnDocument: "after"
                }
            );
        }

        console.log("Achievements seeded successfully");

    } catch (error) {

        console.error(
            "Achievement Seed Error:",
            error.message
        );

    }
};

module.exports = seedAchievements;