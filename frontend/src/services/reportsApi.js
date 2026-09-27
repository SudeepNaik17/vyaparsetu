import { apiClient } from "./apiClient.js";
export const list = (days = 7) => apiClient("/reports?days=" + days);
