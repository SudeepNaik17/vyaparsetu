import Card from "@/components/ui/Card";
import { formatCurrency } from "@/utils/formatCurrency";
export default function TopProducts({ rows = [] }) {
  return (
    <Card className="chart-card">
      <h2>Top products</h2>
      {rows.length ? (
        rows.map((r, i) => (
          <div className="top-product" key={i}>
            <span>
              {r.name}
              <small>{r.quantity} units sold</small>
            </span>
            <strong>{formatCurrency(r.revenue)}</strong>
          </div>
        ))
      ) : (
        <p className="helper">No sales in this period.</p>
      )}
    </Card>
  );
}
