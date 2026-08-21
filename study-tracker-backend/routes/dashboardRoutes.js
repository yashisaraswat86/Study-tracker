const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getDashboard,
  getWeeklyAnalytics,
  getSubjectAnalytics,
  getMonthlyAnalytics,
  getStudyStreak,
  getProductivityScore,
  getRecentSessions,
  getUpcomingTasks,
  getTopSubject,
  getStudyHeatmap,
  getWeeklyComparison,
  getStudyDistribution,
  getAverageSession,
  getLongestSession,
  getBestStudyDay,
  getPreferredStudyTime,
  getDashboardOverview,
} = require("../controllers/dashboardController");



router.get("/", protect, getDashboard);
router.get("/weekly", protect, getWeeklyAnalytics);
router.get("/subjects", protect, getSubjectAnalytics);
router.get("/monthly", protect, getMonthlyAnalytics);
router.get("/streak", protect, getStudyStreak);
router.get("/productivity", protect, getProductivityScore);
router.get("/recent", protect, getRecentSessions);
router.get("/upcoming", protect, getUpcomingTasks);
router.get("/top-subject", protect, getTopSubject);
router.get("/heatmap", protect, getStudyHeatmap);
router.get("/comparison", protect, getWeeklyComparison);
router.get("/distribution", protect, getStudyDistribution);
router.get("/average-session", protect, getAverageSession);
router.get("/longest-session", protect, getLongestSession);
router.get("/best-day", protect, getBestStudyDay);
router.get("/preferred-time", protect, getPreferredStudyTime);
router.get("/overview", protect, getDashboardOverview);
module.exports = router;