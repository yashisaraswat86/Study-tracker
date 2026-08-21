const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getAllAchievements,
  getEarnedAchievements,
  getLockedAchievements,
  getAchievementProgress,
} = require("../controllers/achievementController");

// =====================================
// All Achievements
// =====================================
router.get("/", protect, getAllAchievements);

// =====================================
// Earned Achievements
// =====================================
router.get("/earned", protect, getEarnedAchievements);

// =====================================
// Locked Achievements
// =====================================
router.get("/locked", protect, getLockedAchievements);

// =====================================
// Achievement Progress
// =====================================
router.get("/progress", protect, getAchievementProgress);

module.exports = router;