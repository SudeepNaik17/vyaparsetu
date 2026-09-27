import { apiClient } from "./apiClient.js";
import { udhaar as map } from "./mappers.js";
export async function list() {
  return (await apiClient("/udhaar")).udhaar.map(map);
}
export async function get(id) {
  return map((await apiClient("/udhaar/" + id)).udhaar);
}
export const submit = (body) => apiClient("/udhaar", { method: "POST", body });
export const pay = (id, amount) =>
  apiClient("/udhaar/" + id + "/pay", { method: "POST", body: { amount } });
