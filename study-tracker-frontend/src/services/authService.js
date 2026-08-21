import api from "./api";

// Register
export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);

  return response.data;
};

// Login
export const loginUser = async (userData) => {
  const response = await api.post("/auth/login", userData);

  return response.data;
};