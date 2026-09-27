"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { translations } from "@/data/translations";
const LanguageContext = createContext(null);
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en");
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  const t = (key) => translations[language]?.[key] || key;
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
export const useLanguage = () => useContext(LanguageContext);
