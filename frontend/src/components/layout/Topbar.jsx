"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { useLanguage } from "@/hooks/useLanguage";
export default function Topbar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const { data, user } = useApp();
  const inventoryRows = data.inventory;
  const customerRows = data.customer;
  const salesRows = data.sales;
  const notificationRows = data.reports?.notifications || [];
  const results = [
    ...inventoryRows.map((r) => ({
      key: "product-" + r.id,
      label: r.name,
      route: "/inventory",
      query: r.name,
      type: "Inventory",
    })),
    ...customerRows.map((r) => ({
      key: "customer-" + r.id,
      label: r.name,
      route: "/customer",
      query: r.name,
      type: "Customers",
    })),
    ...salesRows.map((r) => ({
      key: "sale-" + r.id,
      label: "#" + String(r.id).slice(-6).toUpperCase() + " · " + r.customer,
      route: "/sales",
      query: String(r.id),
      type: "Sales",
    })),
  ].filter((r) => r.label.toLowerCase().includes(query.trim().toLowerCase()));
  const { profile } = useApp();
  const { t } = useLanguage();
  const router = useRouter();
  const home = usePathname() === "/home";
  return (
    <header className="topbar">
      <div>
        {home && (
          <>
            <strong>{user?.name} 👋</strong>
            <small>{profile.business}</small>
          </>
        )}
      </div>
      <form
        className="global-search search"
        onSubmit={(e) => {
          e.preventDefault();
          setSearchOpen(true);
        }}
      >
        <Icon name="Search" size={15} />
        <input
          aria-label={t("Search product, customer, or anything...")}
          placeholder={t("Search product, customer, or anything...")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>
      <button
        className="icon-button notification"
        aria-label={t("Notifications")}
        onClick={() => setOpen(true)}
      >
        <Icon name="Bell" />
        <i />
      </button>
      <Link
        href="/settings"
        className="profile-avatar"
        aria-label={t("Settings")}
      >
        {user?.name?.trim()?.charAt(0)?.toUpperCase() || "?"}
      </Link>
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
      {searchOpen && (
        <Modal title={t("Search results")} onClose={() => setSearchOpen(false)}>
          {results.length ? (
            <nav className="more-menu">
              {results.map((r) => (
                <button
                  className="search-result"
                  key={r.key}
                  onClick={() => {
                    setSearchOpen(false);
                    router.push(r.route + "?q=" + encodeURIComponent(r.query));
                  }}
                >
                  <span>
                    {r.label}
                    <small>{t(r.type)}</small>
                  </span>
                  <Icon name="ChevronRight" />
                </button>
              ))}
            </nav>
          ) : (
            <p>{t("No results found")}</p>
          )}
        </Modal>
      )}
    </header>
  );
}
