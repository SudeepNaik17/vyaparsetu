import { useApp } from "@/context/AppContext";
export function useUdhaar() {
  const { data, loading, error, refresh } = useApp();
  return { data: data.udhaar, loading, error, refresh };
}
