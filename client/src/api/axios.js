import axios from "axios";

const normalizeApiBase = (rawUrl) => {
  const base = (rawUrl || "").trim().replace(/\/+$/, "");
  if (!base) return "http://localhost:5000/api";
  return /\/api$/i.test(base) ? base : `${base}/api`;
};

const api = axios.create({
  baseURL: normalizeApiBase(import.meta.env.VITE_API_URL),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
