const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const seedAchievements = require("./utils/seedAchievements");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Connect Database
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");

    await seedAchievements();
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
  });


const testRoutes = require("./routes/testRoutes");
app.use("/api/test", testRoutes);

const subjectRoutes = require("./routes/subjectRoutes");
app.use("/api/subjects", subjectRoutes);


const sessionRoutes = require("./routes/sessionRoutes");
app.use("/api/sessions", sessionRoutes);


const taskRoutes = require("./routes/taskRoutes");
app.use("/api/tasks", taskRoutes);

const dashboardRoutes = require("./routes/dashboardRoutes");
app.use("/api/dashboard", dashboardRoutes);

const goalRoutes=require("./routes/goalRoutes");
app.use("/api/goals",goalRoutes);

const achievementRoutes = require("./routes/achievementRoutes");
app.use("/api/achievements", achievementRoutes);

const scheduleRoutes = require("./routes/scheduleRoutes");
app.use("/api/schedules", scheduleRoutes);

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});