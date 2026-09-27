import Avatar from "@/components/ui/Avatar";
import StatusPill from "@/components/ui/StatusPill";
import Icon from "@/components/ui/Icon";
import { formatCurrency } from "@/utils/formatCurrency";
export default function CustomerCard({ row: r, onSelect }) {
  return (
    <article className="mobile-data-card customer-card">
      <Avatar name={r.name} />
      <button className="customer-detail" onClick={() => onSelect(r)}>
        <b>{r.name}</b>
        <small>+91 {r.mobile}</small>
        <small>{formatCurrency(r.total)} purchases</small>
      </button>
      {r.pending ? (
        <strong className="text-brand">{formatCurrency(r.pending)}</strong>
      ) : (
        <StatusPill status="Paid" />
      )}
      <a
        className="call-button"
        href={"tel:+91" + r.mobile}
        aria-label={"Call " + r.name}
      >
        <Icon name="Phone" size={16} />
      </a>
    </article>
  );
}
