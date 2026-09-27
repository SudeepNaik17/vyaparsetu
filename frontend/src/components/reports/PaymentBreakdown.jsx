import Card from "@/components/ui/Card";
import { formatCurrency } from "@/utils/formatCurrency";
export default function PaymentBreakdown({ payments = {} }) {
  return (
    <Card className="chart-card">
      <h2>Payment breakdown</h2>
      {Object.entries(payments).map(([method, value]) => (
        <div className="top-product" key={method}>
          <span>{method.toUpperCase()}</span>
          <strong>{formatCurrency(value)}</strong>
        </div>
      ))}
    </Card>
  );
}
