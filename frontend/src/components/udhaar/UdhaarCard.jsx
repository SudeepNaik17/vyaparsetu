import Avatar from "@/components/ui/Avatar";
import StatusPill from "@/components/ui/StatusPill";
import Button from "@/components/ui/Button";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { useLanguage } from "@/hooks/useLanguage";
export default function UdhaarCard({ row: r, onSelect }) {
  const { t } = useLanguage();
  return (
    <article className="mobile-data-card udhaar-card">
      <Avatar name={r.name} />
      <div>
        <b>{r.name}</b>
        <strong className="text-brand">{formatCurrency(r.amount)}</strong>
        <small>{formatDate(r.due)}</small>
      </div>
      <StatusPill status={r.status} />
      <Button
        className="small-button"
        variant={r.amount ? "primary" : "secondary"}
        onClick={() => onSelect(r)}
      >
        {t(r.amount ? "Record payment" : "View")}
      </Button>
    </article>
  );
}
