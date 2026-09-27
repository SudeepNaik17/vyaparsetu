"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import { navItems } from "@/constants/navItems";
import { useLanguage } from "@/hooks/useLanguage";
export default function MobileBottomNav() {
  const path = usePathname();
  const [more, setMore] = useState(false);
  const { t } = useLanguage();
  return (
    <>
      <nav className="bottom-nav" aria-label="Mobile navigation">
        {navItems.slice(0, 4).map(([route, label, icon]) => (
          <Link
            key={route}
            href={"/" + route}
            className={path === "/" + route ? "selected" : ""}
          >
            <Icon name={icon} size={20} />
            <span>{t(label)}</span>
          </Link>
        ))}
        <button
          className={
            !["/home", "/sales", "/inventory", "/udhaar"].includes(path)
              ? "selected"
              : ""
          }
          onClick={() => setMore(true)}
        >
          <Icon name="Grid3X3" size={20} />
          <span>{t("More")}</span>
        </button>
      </nav>
      {more && (
        <Modal title={t("More")} onClose={() => setMore(false)}>
          <nav className="more-menu">
            {navItems.slice(4).map(([route, label, icon]) => (
              <Link
                key={route}
                href={"/" + route}
                onClick={() => setMore(false)}
              >
                <Icon name={icon} />
                {t(label)}
                <Icon name="ChevronRight" />
              </Link>
            ))}
            <Link href="/login" onClick={() => setMore(false)}>
              <Icon name="LogOut" />
              {t("Login")}
            </Link>
          </nav>
        </Modal>
      )}
    </>
  );
}
