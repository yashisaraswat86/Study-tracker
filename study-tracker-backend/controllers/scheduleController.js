const mongoose = require("mongoose");
const Schedule = require("../models/Schedule");
const Subject = require("../models/Subject");

// ===============================
// Create Schedule
// ===============================
const createSchedule = async (req, res) => {
  try {
    const {
      subject,
      title,
      description,
      date,
      startTime,
      endTime,
    } = req.body;

    if (!subject || !title || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message:
          "Subject, title, date, start time and end time are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(subject)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject ID",
      });
    }

    // Make sure subject belongs to logged-in user
    const existingSubject = await Subject.findOne({
      _id: subject,
      user: req.user.id,
    });

    if (!existingSubject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    // Validate time
    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    const schedule = await Schedule.create({
      user: req.user.id,
      subject,
      title: title.trim(),
      description: description?.trim() || "",
      date,
      startTime,
      endTime,
    });

    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate("subject", "name color")
      .lean();

    return res.status(201).json({
      success: true,
      message: "Schedule created successfully",
      schedule: populatedSchedule,
    });
  } catch (error) {
    console.error("Create Schedule Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Get All Schedules
// ===============================
const getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({
      user: req.user.id,
    })
      .populate("subject", "name color")
      .sort({ date: 1, startTime: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: schedules.length,
      schedules,
    });
  } catch (error) {
    console.error("Get Schedules Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Get Today's Schedule
// ===============================
const getTodaySchedule = async (req, res) => {
  try {
    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const schedules = await Schedule.find({
      user: req.user.id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate("subject", "name color")
      .sort({ startTime: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: schedules.length,
      schedules,
    });
  } catch (error) {
    console.error("Get Today's Schedule Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Update Schedule
// ===============================
const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid schedule ID",
      });
    }

    const schedule = await Schedule.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    const {
      subject,
      title,
      description,
      date,
      startTime,
      endTime,
    } = req.body;

    if (subject !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(subject)) {
        return res.status(400).json({
          success: false,
          message: "Invalid subject ID",
        });
      }

      const existingSubject = await Subject.findOne({
        _id: subject,
        user: req.user.id,
      });

      if (!existingSubject) {
        return res.status(404).json({
          success: false,
          message: "Subject not found",
        });
      }

      schedule.subject = subject;
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty",
        });
      }

      schedule.title = title.trim();
    }

    if (description !== undefined) {
      schedule.description = description.trim();
    }

    if (date !== undefined) {
      schedule.date = date;
    }

    if (startTime !== undefined) {
      schedule.startTime = startTime;
    }

    if (endTime !== undefined) {
      schedule.endTime = endTime;
    }

    if (schedule.startTime >= schedule.endTime) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    await schedule.save();

    const updatedSchedule = await Schedule.findById(schedule._id)
      .populate("subject", "name color")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Schedule updated successfully",
      schedule: updatedSchedule,
    });
  } catch (error) {
    console.error("Update Schedule Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Delete Schedule
// ===============================
const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid schedule ID",
      });
    }

    const schedule = await Schedule.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    await schedule.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Schedule deleted successfully",
    });
  } catch (error) {
    console.error("Delete Schedule Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createSchedule,
  getSchedules,
  getTodaySchedule,
  updateSchedule,
  deleteSchedule,
};