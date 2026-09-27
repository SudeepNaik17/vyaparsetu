import ProductArt from "@/components/ui/ProductArt";
import StatusPill from "@/components/ui/StatusPill";
import Icon from "@/components/ui/Icon";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
export default function InventoryCard({ row: r, onSelect }) {
  return (
    <article className="mobile-data-card inventory-card">
      <ProductArt kind={r.art} />
      <div>
        <b>{r.name}</b>
        <p>
          {r.category} · {r.stock} {r.unit} · {formatCurrency(r.price)}
        </p>
        <small>{formatDate(r.expiry)}</small>
      </div>
      <div>
        <button
          className="icon-button"
          aria-label={"View " + r.name}
          onClick={() => onSelect(r)}
        >
          <Icon name="MoreVertical" size={17} />
        </button>
        <StatusPill status={r.status} />
      </div>
    </article>
  );
}
