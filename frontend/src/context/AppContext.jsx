"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { LanguageProvider, useLanguage } from "./LanguageContext";
import * as auth from "@/services/authApi";
import { setToken } from "@/services/apiClient";
import { list as inventory } from "@/services/inventoryApi";
import { list as sales } from "@/services/salesApi";
import { list as udhaar } from "@/services/udhaarApi";
import { list as customer } from "@/services/customerApi";
import { list as reports } from "@/services/reportsApi";
const Context = createContext(null);
const empty = {
  inventory: [],
  sales: [],
  udhaar: [],
  customer: [],
  reports: null,
};
function PreferenceSync({ user }) {
  const { setTheme } = useTheme();
  const { setLanguage } = useLanguage();
  useEffect(() => {
    if (user?.settings) {
      setTheme(user.settings.theme || "Light");
      setLanguage(user.settings.language || "en");
    }
  }, [user?.settings]);
  return null;
}
export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [draft, setDraft] = useState(null);
  const [toast, setToast] = useState("");
  const timer = useRef();
  const notify = useCallback((message) => {
    clearTimeout(timer.current);
    setToast(message);
    timer.current = setTimeout(() => setToast(""), 6500);
  }, []);
  const refresh = useCallback(() => setRevision((v) => v + 1), []);
  function logout() {
    setToken(null);
    setUser(null);
    setDraft(null);
    setData(empty);
    setError("");
  }
  useEffect(() => {
    const expired = () => {
      logout();
      notify("Your session expired. Please log in again.");
    };
    window.addEventListener("session-expired", expired);
    return () => {
      window.removeEventListener("session-expired", expired);
      clearTimeout(timer.current);
    };
  }, [notify]);
  async function authenticate(mode, values) {
    const response = await auth[mode](values);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  }
  useEffect(() => {
    let active = true;
    if (!user) {
      setData(empty);
      return;
    }
    setLoading(true);
    setError("");
    Promise.all([inventory(), sales(), udhaar(), customer(), reports()])
      .then(([inventory, sales, udhaar, customer, reports]) => {
        if (active) setData({ inventory, sales, udhaar, customer, reports });
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user?._id, revision]);
  async function setProfile(values) {
    const response = await auth.updateProfile({
      name: values.owner,
      shopName: values.business,
      phone: values.mobile,
    });
    setUser(response.user);
  }
  async function updatePreferences(values) {
    const response = await auth.settings(values);
    setUser(response.user);
  }
  async function setNotifications(value) {
    await updatePreferences({ notifications: value });
  }
  async function changePin(values) {
    const response = await auth.changePin(values);
    setToken(response.token);
    setUser(response.user);
  }
  const profile = {
    owner: user?.name || "",
    business: user?.shopName || "",
    mobile: user?.phone || "",
  };
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Context.Provider
          value={{
            user,
            authenticate,
            logout,
            data,
            loading,
            error,
            refresh,
            draft,
            setDraft,
            notify,
            profile,
            setProfile,
            updatePreferences,
            changePin,
            notifications: user?.settings?.notifications || {},
            setNotifications,
          }}
        >
          <PreferenceSync user={user} />
          {children}
          {toast && (
            <div role="status" className="toast">
              {toast}
              <button
                aria-label="Dismiss notification"
                onClick={() => setToast("")}
              >
                ×
              </button>
            </div>
          )}
        </Context.Provider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
export const useApp = () => useContext(Context);
