const mongoose = require("mongoose");

const goalCompletionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    goal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
    },

    type: {
      type: String,
      enum: ["daily", "weekly"],
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    target: {
      type: Number,
      required: true,
    },

    studyTime: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent the same daily goal from being recorded twice
goalCompletionSchema.index(
  {
    user: 1,
    goal: 1,
    type: 1,
    date: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "GoalCompletion",
  goalCompletionSchema
);