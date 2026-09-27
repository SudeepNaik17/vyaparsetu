import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useApp } from "@/context/AppContext";
import { useLanguage } from "@/hooks/useLanguage";
import { formatCurrency } from "@/utils/formatCurrency";
export default function RecentActivity() {
  const { data } = useApp();
  const { t } = useLanguage();
  const rows = data.reports?.recent || [];
  return (
    <section className="recent-activity">
      <div className="section-heading">
        <h2>{t("Recent activity")}</h2>
        <Link href="/sales">{t("See all")}</Link>
      </div>
      {!rows.length && (
        <p className="helper">Your saved sales will appear here.</p>
      )}
      {rows.map((r) => (
        <Link href="/sales" className="activity-row" key={r.id}>
          <span className="soft-icon">
            <Icon name="ReceiptText" />
          </span>
          <span>
            <b>{r.customer}</b>
            <small>{new Date(r.date).toLocaleString("en-IN")}</small>
          </span>
          <strong>{formatCurrency(r.total)}</strong>
        </Link>
      ))}
    </section>
  );
}
