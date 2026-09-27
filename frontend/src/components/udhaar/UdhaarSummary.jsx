import { useApp } from "@/context/AppContext";
import { formatCurrency } from "@/utils/formatCurrency";
import { useLanguage } from "@/hooks/useLanguage";
export default function UdhaarSummary() {
  const { data } = useApp();
  const { t } = useLanguage();
  const rows = data.udhaar;
  return (
    <div className="udhaar-summary">
      {[
        ["Pending", rows.reduce((n, r) => n + r.amount, 0)],
        [
          "Overdue",
          rows
            .filter((r) => r.status === "Overdue")
            .reduce((n, r) => n + r.amount, 0),
        ],
        ["Collected", rows.reduce((n, r) => n + r.paidAmount, 0)],
      ].map(([label, value]) => (
        <div key={label}>
          <span>{t(label)}</span>
          <strong>{formatCurrency(value)}</strong>
        </div>
      ))}
    </div>
  );
}
