import api from "./api";

// Get daily goal and today's progress
export const getDailyGoal = async () => {
  const response = await api.get("/goals/daily");
  return response.data;
};

// Create or update daily goal
export const setDailyGoal = async (targetSeconds) => {
  const response = await api.post("/goals", {
    type: "daily",
    target: targetSeconds,
  });

  return response.data;
};

// Get weekly goal
export const getWeeklyGoal = async () => {
  const response = await api.get("/goals/weekly");
  return response.data;
};

// Get goal history
export const getGoalHistory = async () => {
  const response = await api.get("/goals/history");
  return response.data;
};

// Get goal statistics
export const getGoalStats = async () => {
  const response = await api.get("/goals/stats");
  return response.data;
};