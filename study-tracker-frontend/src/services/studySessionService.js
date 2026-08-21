import api from "./api";

// Get the currently active study session
export const getActiveSession = async () => {
  const response = await api.get("/sessions/active");
  return response.data;
};

// Get study session history
export const getSessionHistory = async () => {
  const response = await api.get("/sessions/history");
  return response.data;
};

// Start a new study session
export const startStudySession = async (subjectId) => {
  const response = await api.post(
    "/sessions/start",
    {
      subject: subjectId,
    }
  );

  return response.data;
};

// End the currently active study session
export const endStudySession = async () => {
  const response = await api.put(
    "/sessions/end"
  );

  return response.data;
};