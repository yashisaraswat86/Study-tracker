const Task = require("../models/Task");
const Subject = require("../models/Subject");


// =====================================
// Get All Tasks
// =====================================
const getTasks = async (req, res) => {
  try {

    const tasks = await Task.find({
      user: req.user.id,
    })
      .populate("subject", "name color")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });

  } catch (error) {

    console.error("Get Tasks Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =====================================
// Get Single Task
// =====================================
const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({
      _id: id,
      user: req.user.id,
    }).populate("subject", "name color");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      task,
    });

  } catch (error) {
    console.error("Get Task Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// Update Task
// =====================================
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      subject,
      priority,
      dueDate,
      completed,
    } = req.body;

    // Find task belonging to logged-in user
    const task = await Task.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // If subject is being updated, verify ownership
    if (subject) {
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

      task.subject = subject;
    }

    // Update only provided fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (completed !== undefined) task.completed = completed;

    await task.save();

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });

  } catch (error) {
    console.error("Update Task Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// Delete Task
// =====================================
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Find task belonging to logged-in user
    const task = await Task.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Delete task
    await task.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });

  } catch (error) {
    console.error("Delete Task Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// Toggle Task Completion
// =====================================
const toggleTaskCompletion = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Toggle completion status
    task.completed = !task.completed;

    await task.save();

    return res.status(200).json({
      success: true,
      message: `Task marked as ${
        task.completed ? "completed" : "incomplete"
      }`,
      task,
    });

  } catch (error) {
    console.error("Toggle Task Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      priority,
      dueDate,
    } = req.body;

    // Check required fields
    if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Task title is required",
        });
      }

      if (!subject) {
        return res.status(400).json({
          success: false,
          message: "Subject is required",
        });
      }

      if (
        priority !== undefined &&
        !["Low", "Medium", "High"].includes(priority)
      ) {
        return res.status(400).json({
          success: false,
          message: "Priority must be Low, Medium, or High",
        });
      }

      if (dueDate && isNaN(new Date(dueDate).getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid due date",
        });
      }

    // Check whether subject belongs to logged-in user
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

    // Create task
    const task = await Task.create({
      user: req.user.id,
      subject,
      title,
      description,
      priority,
      dueDate,
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });

  } catch (error) {
    console.error("Create Task Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
};
