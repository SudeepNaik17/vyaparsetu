import { useApp } from "@/context/AppContext";
export function useNotifications() {
  const { notifications, setNotifications } = useApp();
  return { notifications, setNotifications };
}
