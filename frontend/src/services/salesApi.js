import { apiClient } from "./apiClient.js";
import { sale as map } from "./mappers.js";
export async function list() {
  return (await apiClient("/sales")).sales.map(map);
}
export const todayProfit = () => apiClient("/sales/today-profit");
export const submit = (body) => apiClient("/sales", { method: "POST", body });
