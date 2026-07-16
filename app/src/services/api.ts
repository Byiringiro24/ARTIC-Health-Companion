/**
 * Axios API client for ARTIC Health Companion mobile app.
 * Automatically attaches JWT bearer token and handles 401 refresh.
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = "http://localhost:4000/api"; // change to deployed URL in production

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ── Attach access token ───────────────────────────────────────────────────────
api.interceptors.request.use(async (cfg: InternalAxiosRequestConfig) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token && cfg.headers) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ── Auto-refresh on 401 ───────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
        await AsyncStorage.setItem("accessToken",  data.accessToken);
        await AsyncStorage.setItem("refreshToken", data.refreshToken);
        if (original.headers) original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        await AsyncStorage.multiRemove(["accessToken","refreshToken","user"]);
      }
    }
    return Promise.reject(err);
  }
);

export default api;
