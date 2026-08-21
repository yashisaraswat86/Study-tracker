const mongoose = require("mongoose");
const Subject = require("../models/Subject");

// ===============================
// Validate Hex Color
// ===============================
const isValidColor = (color) => {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
};

// ===============================
// Create Subject
// ===============================
const createSubject = async (req, res) => {
  try {
    let { name, color } = req.body;

    // Validate name
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Subject name is required",
      });
    }

    name = name.trim();

    // Validate color if provided
    if (color !== undefined && !isValidColor(color)) {
      return res.status(400).json({
        success: false,
        message: "Color must be a valid hex color",
      });
    }

    // Check duplicate subject for this user
    const existingSubject = await Subject.findOne({
      user: req.user.id,
      name: {
        $regex: `^${name}$`,
        $options: "i",
      },
    });

    if (existingSubject) {
      return res.status(409).json({
        success: false,
        message: "Subject already exists",
      });
    }

    // Create subject
    const subject = await Subject.create({
      user: req.user.id,
      name,
      color: color || "#3B82F6",
    });

    return res.status(201).json({
      success: true,
      message: "Subject created successfully",
      subject,
    });

  } catch (error) {
    console.error("Create Subject Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Get All Subjects
// ===============================
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({
      user: req.user.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: subjects.length,
      subjects,
    });

  } catch (error) {
    console.error("Get Subjects Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Update Subject
// ===============================
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body || {};

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject ID",
      });
    }

    // Validate that at least one field is provided
    if (name === undefined && color === undefined) {
      return res.status(400).json({
        success: false,
        message: "Nothing to update",
      });
    }

    // Validate name if provided
    if (
      name !== undefined &&
      (typeof name !== "string" || !name.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Subject name cannot be empty",
      });
    }

    // Validate color if provided
    if (
      color !== undefined &&
      !isValidColor(color)
    ) {
      return res.status(400).json({
        success: false,
        message: "Color must be a valid hex color",
      });
    }

    // Find subject belonging to logged-in user
    const subject = await Subject.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    // Check duplicate name when updating name
    if (name !== undefined) {
      const trimmedName = name.trim();

      const existingSubject = await Subject.findOne({
        _id: { $ne: id },
        user: req.user.id,
        name: {
          $regex: `^${trimmedName}$`,
          $options: "i",
        },
      });

      if (existingSubject) {
        return res.status(409).json({
          success: false,
          message: "Subject already exists",
        });
      }

      subject.name = trimmedName;
    }

    // Update color
    if (color !== undefined) {
      subject.color = color;
    }

    await subject.save();

    return res.status(200).json({
      success: true,
      message: "Subject updated successfully",
      subject,
    });

  } catch (error) {
    console.error("Update Subject Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Delete Subject
// ===============================
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject ID",
      });
    }

    // Find subject belonging to logged-in user
    const subject = await Subject.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    await subject.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Subject deleted successfully",
    });

  } catch (error) {
    console.error("Delete Subject Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
};