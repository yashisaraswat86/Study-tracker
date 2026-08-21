const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
} = require("../controllers/taskController");

// Create Task
router.post("/", protect, createTask);

// Get All Tasks
router.get("/", protect, getTasks);

// Get Single Task
router.get("/:id", protect, getTask);

// Update Task
router.put("/:id", protect, updateTask);

// Complete / Incomplete Task
router.patch(
  "/:id/complete",
  protect,
  toggleTaskCompletion
);

// Delete Task
router.delete("/:id", protect, deleteTask);

module.exports = router;