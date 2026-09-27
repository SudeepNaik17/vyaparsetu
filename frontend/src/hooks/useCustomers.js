import { useApp } from "@/context/AppContext";
export function useCustomers() {
  const { data, loading, error, refresh } = useApp();
  return { data: data.customer, loading, error, refresh };
}
