const mongoose = require("mongoose");

const studySessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      default: null,
    },

    // Duration is stored in SECONDS
    duration: {
      type: Number,
      default: 0,
      min: 0,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: ["ongoing", "completed"],
      default: "ongoing",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "StudySession",
  studySessionSchema
);