import api from "./api";

// Get all achievements with user's unlock status
export const getAchievements = async () => {
  const response = await api.get("/achievements");
  return response.data;
};

// Get earned achievements
export const getEarnedAchievements = async () => {
  const response = await api.get(
    "/achievements/earned"
  );

  return response.data;
};

// Get locked achievements
export const getLockedAchievements = async () => {
  const response = await api.get(
    "/achievements/locked"
  );

  return response.data;
};

// Get achievement progress
export const getAchievementProgress = async () => {
  const response = await api.get(
    "/achievements/progress"
  );

  return response.data;
};