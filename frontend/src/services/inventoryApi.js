import { apiClient } from "./apiClient.js";
import { product as map } from "./mappers.js";
export async function list() {
  return (await apiClient("/products")).products.map(map);
}
export async function get(id) {
  return map((await apiClient("/products/" + id)).product);
}
export const submit = (body) =>
  apiClient("/products", { method: "POST", body });
export const update = (id, body) =>
  apiClient("/products/" + id, { method: "PATCH", body });
export const remove = (id) =>
  apiClient("/products/" + id, { method: "DELETE" });
export const addStock = (id, quantity) =>
  apiClient("/products/" + id + "/stock", {
    method: "POST",
    body: { quantity },
  });
