import { useApp } from "@/context/AppContext";
export function useSales() {
  const { data, loading, error, refresh } = useApp();
  return { data: data.sales, loading, error, refresh };
}
