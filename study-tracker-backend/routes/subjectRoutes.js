const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
} = require("../controllers/subjectController");

// Create & Get
router
  .route("/")
  .post(protect, createSubject)
  .get(protect, getSubjects);

// Update & Delete
router
  .route("/:id")
  .put(protect, updateSubject)
  .delete(protect, deleteSubject);

module.exports = router;