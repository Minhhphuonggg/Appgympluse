import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:2323",
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("gym_admin_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function apiRequest(config) {
  const response = await api(config);
  return response.data;
}

export function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || "Unexpected error";
}

export default api;
