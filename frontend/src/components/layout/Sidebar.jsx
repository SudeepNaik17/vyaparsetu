"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Brand from "@/components/ui/Brand";
import Icon from "@/components/ui/Icon";
import { navItems } from "@/constants/navItems";
import { useLanguage } from "@/hooks/useLanguage";
export default function Sidebar() {
  const path = usePathname();
  const { t } = useLanguage();
  return (
    <aside className="sidebar">
      <Link href="/home" className="brand-link">
        <Brand />
      </Link>
      <nav aria-label="Main navigation">
        {navItems.map(([route, label, icon]) => (
          <Link
            aria-current={path === "/" + route ? "page" : undefined}
            className={path === "/" + route ? "selected" : ""}
            key={route}
            href={"/" + route}
          >
            <Icon name={icon} />
            {t(label)}
          </Link>
        ))}
      </nav>
      <Link href="/support" className="sidebar-help">
        <span>
          <Icon name="LifeBuoy" /> <b>{t("Need help?")}</b>
        </span>
        <small>
          {t("Call or WhatsApp")}
          <br />
          {t("We are here to help.")}
        </small>
      </Link>
      <small className="demo-label">Connected workspace</small>
    </aside>
  );
}
