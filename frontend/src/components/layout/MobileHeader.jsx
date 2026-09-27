"use client";
import { useState } from "react";
import Link from "next/link";
import Brand from "@/components/ui/Brand";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { useLanguage } from "@/hooks/useLanguage";
export default function MobileHeader() {
  const [open, setOpen] = useState(false);
  const { data } = useApp();
  const notificationRows = data.reports?.notifications || [];
  const { t } = useLanguage();
  return (
    <header className="mobile-header">
      <Link href="/home">
        <Brand />
      </Link>
      <button
        className="icon-button notification"
        aria-label={t("Notifications")}
        onClick={() => setOpen(true)}
      >
        <Icon name="Bell" />
        <i />
      </button>
      {open && (
        <Modal title={t("Notifications")} onClose={() => setOpen(false)}>
          {notificationRows.map((n) => (
            <div className="notification-row" key={n.id}>
              <b>{t(n.title)}</b>
              <p>{t(n.detail)}</p>
            </div>
          ))}
        </Modal>
      )}
    </header>
  );
}
