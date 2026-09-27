import { apiClient } from "./apiClient.js";
import { customer as map } from "./mappers.js";
export async function list() {
  return (await apiClient("/customers")).customers.map(map);
}
export async function get(id) {
  return map((await apiClient("/customers/" + id)).customer);
}
export const submit = (body) =>
  apiClient("/customers", { method: "POST", body });
export const update = (id, body) =>
  apiClient("/customers/" + id, { method: "PATCH", body });
