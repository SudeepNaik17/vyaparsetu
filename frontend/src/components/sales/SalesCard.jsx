import Icon from "@/components/ui/Icon";
import { formatCurrency } from "@/utils/formatCurrency";
export default function SalesCard({ row: r, onSelect }) {
  return (
    <article className="mobile-data-card sales-card">
      <b className="text-brand">#{String(r.id).slice(-6).toUpperCase()}</b>
      <div>
        <b>{r.customer}</b>
        <small>
          {r.items} items · {r.payment}
        </small>
      </div>
      <div>
        <b>{formatCurrency(r.amount)}</b>
        <small>{r.time}</small>
      </div>
      <button
        className="icon-button"
        aria-label={"View bill " + r.id}
        onClick={() => onSelect(r)}
      >
        <Icon name="MoreVertical" size={16} />
      </button>
    </article>
  );
}
