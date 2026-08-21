const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
    setGoal,
    getDailyGoal,
    getWeeklyGoal,
    getGoalHistory,
    getGoalStats
} = require("../controllers/goalController");

// =====================================
// Create / Update Goal
// =====================================
router.post(
    "/",
    protect,
    setGoal
);

// =====================================
// Get Daily Goal Progress
// =====================================
router.get(
    "/daily",
    protect,
    getDailyGoal
);

// =====================================
// Get Weekly Goal Progress
// =====================================
router.get(
    "/weekly",
    protect,
    getWeeklyGoal
);

// =====================================
// Get Goal Completion History
// =====================================
router.get(
    "/history",
    protect,
    getGoalHistory
);

// =====================================
// Get Goal Statistics
// =====================================
router.get(
    "/stats",
    protect,
    getGoalStats
);

module.exports = router;


