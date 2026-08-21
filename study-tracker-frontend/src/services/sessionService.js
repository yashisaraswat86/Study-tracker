import api from "./api";

// Start a study session
export const startSession = async (subject) => {
  const response = await api.post(
    "/sessions/start",
    {
      subject,
    }
  );

  return response.data;
};

// Get currently active session
export const getActiveSession = async () => {
  const response = await api.get(
    "/sessions/active"
  );

  return response.data;
};

// End the active study session
export const endSession = async () => {
  const response = await api.put(
    "/sessions/end"
  );

  return response.data;
};

// Get study session history
export const getSessionHistory = async () => {
  const response = await api.get(
    "/sessions/history"
  );

  return response.data;
};