import api from "./api";

// Get all schedules
export const getSchedules = async () => {
  const response = await api.get("/schedules");
  return response.data;
};

// Get today's schedules
export const getTodaySchedule = async () => {
  const response = await api.get("/schedules/today");
  return response.data;
};

// Create schedule
export const createSchedule = async (scheduleData) => {
  const response = await api.post(
    "/schedules",
    scheduleData
  );

  return response.data;
};

// Update schedule
export const updateSchedule = async (id, scheduleData) => {
  const response = await api.put(
    `/schedules/${id}`,
    scheduleData
  );

  return response.data;
};

// Delete schedule
export const deleteSchedule = async (id) => {
  const response = await api.delete(
    `/schedules/${id}`
  );

  return response.data;
};