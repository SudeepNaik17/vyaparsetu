"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileHeader from "./MobileHeader";
import MobileBottomNav from "./MobileBottomNav";
export default function PageContainer({ children }) {
  const { user, error, refresh } = useApp();
  const router = useRouter();
  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);
  if (!user) return <p className="helper">Please log in to continue…</p>;
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Sidebar />
      <div className="workspace">
        <Topbar />
        <MobileHeader />
        <main id="main">
          {error && (
            <div className="notice" role="alert">
              {error}{" "}
              <button className="text-button" onClick={refresh}>
                Retry
              </button>
            </div>
          )}
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
