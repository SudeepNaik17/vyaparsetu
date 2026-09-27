import { apiClient } from "./apiClient.js";
export const register = (data) =>
  apiClient("/auth/register", { method: "POST", body: data });
export const login = (data) =>
  apiClient("/auth/login", { method: "POST", body: data });
export const profile = () => apiClient("/auth/profile");
export const updateProfile = (data) =>
  apiClient("/auth/profile", { method: "PATCH", body: data });
export const settings = (data) =>
  apiClient("/auth/settings", { method: "PATCH", body: data });
export const changePin = (data) =>
  apiClient("/auth/pin", { method: "POST", body: data });
export const workers = () => apiClient("/auth/workers");
export const createWorker = (data) =>
  apiClient("/auth/workers", { method: "POST", body: data });
