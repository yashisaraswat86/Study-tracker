const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createSchedule,
  getSchedules,
  getTodaySchedule,
  updateSchedule,
  deleteSchedule,
} = require("../controllers/scheduleController");

// Create schedule
router
  .route("/")
  .post(protect, createSchedule)
  .get(protect, getSchedules);

// Today's schedule
router.get(
  "/today",
  protect,
  getTodaySchedule
);

// Update / Delete
router
  .route("/:id")
  .put(protect, updateSchedule)
  .delete(protect, deleteSchedule);

module.exports = router;