import { useApp } from "@/context/AppContext";
export function useInventory() {
  const { data, loading, error, refresh } = useApp();
  return { data: data.inventory, loading, error, refresh };
}
