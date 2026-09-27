import { useApp } from "@/context/AppContext";
export function useAuth() {
  const { user, authenticate, logout } = useApp();
  return { user, authenticated: !!user, authenticate, logout };
}
