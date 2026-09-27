import { useTheme as useThemeContext } from "@/context/ThemeContext";
import { useApp } from "@/context/AppContext";
export function useTheme() {
  const context = useThemeContext();
  const { user, updatePreferences, notify } = useApp();
  return {
    ...context,
    setTheme: async (value) => {
      try {
        if (user) await updatePreferences({ theme: value });
        context.setTheme(value);
      } catch (e) {
        notify(e.message);
      }
    },
  };
}
