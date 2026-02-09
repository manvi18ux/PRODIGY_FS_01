import axios from "axios";

// Use environment variable FIRST, fallback to Render URL
const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://auth-app-backend-wfnz.onrender.com/api/auth";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ================================
// AUTH FUNCTIONS
// ================================

export const register = async (userData) => {
  const response = await api.post("/register", userData);

  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }

  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post("/login", credentials);

  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/me");
  return response.data;
};

export const updateUserDetails = async (userData) => {
  const response = await api.put("/updatedetails", userData);

  if (response.data.user) {
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }

  return response.data;
};

export const updatePassword = async (passwords) => {
  const response = await api.put("/updatepassword", passwords);

  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }

  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  return api.get("/logout");
};

// ADMIN ONLY
export const getAllUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export default api;