import Link from "next/link";
import MetricCard from "./MetricCard";
import { useApp } from "@/context/AppContext";
import { useLanguage } from "@/hooks/useLanguage";
import { formatCurrency } from "@/utils/formatCurrency";
export default function BusinessSummary() {
  const { data } = useApp();
  const { t } = useLanguage();
  const s = data.reports?.summary;
  return (
    <section className="business-summary">
      <div className="section-heading">
        <h2>{t("Today's business")}</h2>
        <Link href="/reports">{t("View report")}</Link>
      </div>
      <div className="metrics-grid">
        {[
          ["Today's Sales", s?.sales, (s?.orders || 0) + " bills"],
          ["Profit", s?.profit, ""],
          ["Pending Udhaar", s?.pending, (s?.customers || 0) + " customers"],
          ["Inventory Value", s?.inventory, (s?.products || 0) + " products"],
        ].map(([label, value, note]) => (
          <MetricCard
            key={label}
            label={label}
            value={value == null ? "—" : formatCurrency(value)}
            note={note}
          />
        ))}
      </div>
    </section>
  );
}
