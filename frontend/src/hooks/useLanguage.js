import { useLanguage as useLanguageContext } from "@/context/LanguageContext";
import { useApp } from "@/context/AppContext";
export function useLanguage() {
  const context = useLanguageContext();
  const { user, updatePreferences, notify } = useApp();
  return {
    ...context,
    setLanguage: async (value) => {
      try {
        if (user) await updatePreferences({ language: value });
        context.setLanguage(value);
      } catch (e) {
        notify(e.message);
      }
    },
  };
}
