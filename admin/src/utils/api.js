import axios from "axios";
import { backendUrl } from "../App";

const api = axios.create({
  baseURL: backendUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
