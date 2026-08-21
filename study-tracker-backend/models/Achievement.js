const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        icon: {
            type: String,
            required: true
        },

        type: {
            type: String,
            enum: [
                "first_session",
                "study_time",
                "sessions",
                "streak",
                "daily_goal",
                "weekly_goal"
            ],
            required: true
        },

        target: {
            type: Number,
            required: true,
            min: 1
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Achievement", achievementSchema);