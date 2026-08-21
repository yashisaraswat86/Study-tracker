const mongoose = require("mongoose");

const userAchievementSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        achievement: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Achievement",
            required: true
        },

        unlocked: {
            type: Boolean,
            default: false
        },

        unlockedAt: {
            type: Date,
            default: null
        },

        progress: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

// One user should have only one record for each achievement
userAchievementSchema.index(
    {
        user: 1,
        achievement: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model(
    "UserAchievement",
    userAchievementSchema
);