"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import PaymentModal from "@/components/ui/PaymentModal";
import SearchBar from "@/components/ui/SearchBar";
import Filters from "@/components/ui/Filters";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import EntryModal from "@/components/ui/EntryModal";
import VoiceEntryModal from "@/components/voice/VoiceEntryModal";
import InventoryTable from "@/components/inventory/InventoryTable";
import InventoryCard from "@/components/inventory/InventoryCard";
import SalesTable from "@/components/sales/SalesTable";
import SalesCard from "@/components/sales/SalesCard";
import UdhaarTable from "@/components/udhaar/UdhaarTable";
import UdhaarCard from "@/components/udhaar/UdhaarCard";
import UdhaarSummary from "@/components/udhaar/UdhaarSummary";
import CustomerTable from "@/components/customer/CustomerTable";
import CustomerCard from "@/components/customer/CustomerCard";
import { useInventory } from "@/hooks/useInventory";
import { useSales } from "@/hooks/useSales";
import { useUdhaar } from "@/hooks/useUdhaar";
import { useCustomers } from "@/hooks/useCustomers";
import { useLanguage } from "@/hooks/useLanguage";
import { useApp } from "@/context/AppContext";
import { formatCurrency } from "@/utils/formatCurrency";
const config = {
  inventory: {
    title: "Inventory",
    subtitle: "Manage your stock. Never run out.",
    add: "Add Product",
    voice: "Voice add",
    options: ["All", "Low stock", "Expiring"],
    Table: InventoryTable,
    Card: InventoryCard,
  },
  sales: {
    title: "Sales",
    subtitle: "Create bills. Grow your business.",
    add: "Manual sale",
    voice: "Voice sale",
    options: ["All", "Cash", "UPI", "Udhaar"],
    Table: SalesTable,
    Card: SalesCard,
  },
  udhaar: {
    title: "Udhaar",
    subtitle: "Clear accounts. Better relationships.",
    add: "Add Udhaar",
    voice: "Voice add",
    options: ["All", "Overdue", "Due soon", "Paid"],
    Table: UdhaarTable,
    Card: UdhaarCard,
  },
  customer: {
    title: "Customers",
    subtitle: "250 customers · 5 new this week",
    add: "Add manually",
    voice: "Add by voice",
    options: [],
    Table: CustomerTable,
    Card: CustomerCard,
  },
};
export default function RecordsScreen({ kind }) {
  const searchParams = useSearchParams();
  const inventory = useInventory(),
    sales = useSales(),
    udhaar = useUdhaar(),
    customer = useCustomers();
  const { data, loading, error } = { inventory, sales, udhaar, customer }[kind];
  const c = config[kind];
  const { t } = useLanguage();
  const { notify } = useApp();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [category, setCategory] = useState("All");
  const [date, setDate] = useState("");
  const [sort, setSort] = useState("Recent");
  const [page, setPage] = useState(1);
  const [entry, setEntry] = useState(false);
  const [voice, setVoice] = useState(false);
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);
  useEffect(() => setPage(1), [query, filter, category, date, sort]);
  let filtered = data.filter(
    (r) =>
      JSON.stringify(r).toLowerCase().includes(query.toLowerCase()) &&
      (filter === "All" ||
        r.status === filter ||
        r.payment === filter ||
        (filter === "Expiring" &&
          r.expiry &&
          r.expiry <=
            new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10))) &&
      (category === "All" || r.category === category) &&
      (!date || r.date === date),
  );
  if (sort === "Name")
    filtered = [...filtered].sort((a, b) =>
      (a.name || "").localeCompare(b.name || ""),
    );
  if (sort === "Pending")
    filtered = [...filtered].sort((a, b) => b.pending - a.pending);
  const shown = filtered.slice((page - 1) * 5, page * 5);
  const Table = c.Table,
    MobileCard = c.Card;
  return (
    <>
      <PageHeader
        title={c.title}
        subtitle={kind === "customer" ? data.length + " customers" : c.subtitle}
      >
        <Button
          icon="Mic"
          variant={
            kind === "sales" || kind === "customer" ? "primary" : "secondary"
          }
          onClick={() => setVoice(true)}
        >
          {t(c.voice)}
        </Button>
        <Button
          icon="Plus"
          variant={
            kind === "sales" || kind === "customer" ? "secondary" : "primary"
          }
          onClick={() => setEntry(true)}
        >
          {t(c.add)}
        </Button>
      </PageHeader>
      {kind === "udhaar" && <UdhaarSummary />}
      {kind === "inventory" && (
        <button className="mobile-stock-banner" onClick={() => setVoice(true)}>
          <span>
            <Icon name="Mic" />
          </span>
          <div>
            <b>{t("Add stock with your voice")}</b>
            <small>{t("Speak, review and confirm.")}</small>
          </div>
          <Icon name="AudioLines" />
        </button>
      )}
      <section className="records">
        <div className="records-toolbar">
          <Filters options={c.options} value={filter} onChange={setFilter} />
          {kind === "inventory" && (
            <select
              aria-label={t("Category")}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {["All", "Staples", "Oil", "Dairy", "Biscuits", "Snacks"].map(
                (x) => (
                  <option key={x} value={x}>
                    {x === "All" ? t("Category") : x}
                  </option>
                ),
              )}
            </select>
          )}
          {kind === "sales" && (
            <input
              aria-label={t("Filter by date")}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          )}{" "}
          {date && (
            <button className="text-button" onClick={() => setDate("")}>
              {t("Clear")}
            </button>
          )}
          {kind === "customer" && (
            <select
              aria-label={t("Sort customers")}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {["Recent", "Name", "Pending"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          )}
        </div>
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder={t(
            kind === "inventory"
              ? "Search product, brand or batch..."
              : kind === "sales"
                ? "Search bill or customer..."
                : "Search customer or mobile...",
          )}
        />
        {loading ? (
          <p role="status">{t("Loading...")}</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : shown.length ? (
          <>
            <Table rows={shown} onSelect={setSelected} />
            <div className="mobile-records">
              {shown.map((r) => (
                <MobileCard key={r.id} row={r} onSelect={setSelected} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            title={t("No results found")}
            detail={t("Try a different search or filter.")}
          />
        )}
        <Pagination page={page} total={filtered.length} onChange={setPage} />
      </section>
      {entry && <EntryModal kind={kind} onClose={() => setEntry(false)} />}{" "}
      {voice && <VoiceEntryModal kind={kind} onClose={() => setVoice(false)} />}{" "}
      {selected && kind === "udhaar" && selected.amount > 0 && (
        <PaymentModal record={selected} onClose={() => setSelected(null)} />
      )}
      {selected && !(kind === "udhaar" && selected.amount > 0) && (
        <Modal title={t("Entry details")} onClose={() => setSelected(null)}>
          <dl className="detail-list">
            {Object.entries(selected)
              .filter(([k]) => k !== "art")
              .map(([k, v]) => (
                <div key={k}>
                  <dt>{t(k)}</dt>
                  <dd>
                    {["amount", "price", "pending", "total"].includes(k)
                      ? formatCurrency(v)
                      : k === "lines"
                        ? v.map((line, i) => (
                            <p key={i}>
                              {line.name} · {line.quantity} ×{" "}
                              {formatCurrency(line.unitPrice)}
                            </p>
                          ))
                        : String(v ?? "—")}
                  </dd>
                </div>
              ))}
          </dl>
          {kind === "inventory" && (
            <Button
              icon="Pencil"
              onClick={() => {
                setSelected(null);
                setEntry(true);
              }}
            >
              {t("Add Product")}
            </Button>
          )}
        </Modal>
      )}
    </>
  );
}
