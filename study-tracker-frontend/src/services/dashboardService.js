import api from "./api";

export const getDashboardOverview = async () => {
  const response = await api.get(
    "/dashboard/overview"
  );

  return response.data;
};

export const getUpcomingTasks = async () => {
  const response = await api.get(
    "/dashboard/upcoming"
  );

  return response.data;
};