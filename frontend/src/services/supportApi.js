import { apiClient } from "./apiClient.js";
export const list = () => apiClient("/support");
export const submit = (body) => apiClient("/support", { method: "POST", body });
export const update = (id, body) =>
	apiClient("/support/" + id, { method: "PATCH", body });
export const attachment = (id) =>
	apiClient("/support/" + id + "/attachment", { responseType: "blob" });
