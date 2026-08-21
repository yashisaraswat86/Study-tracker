const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  startSession,
  endSession,
  getActiveSession,
  getSessionHistory,
} = require("../controllers/sessionController");

// =====================================
// Start Study Session
// =====================================
router.post(
  "/start",
  protect,
  startSession
);

// =====================================
// Get Active Study Session
// =====================================
router.get(
  "/active",
  protect,
  getActiveSession
);

// =====================================
// Get Study Session History
// =====================================
router.get(
  "/history",
  protect,
  getSessionHistory
);

// =====================================
// End Study Session
// =====================================
router.put(
  "/end",
  protect,
  endSession
);

module.exports = router;