import Card from "@/components/ui/Card";
import { useLanguage } from "@/hooks/useLanguage";
export default function SalesChart({ values, days, title = "Sales overview" }) {
  const { t } = useLanguage();
  const max = Math.max(1, ...values);
  return (
    <Card className="chart-card">
      <h2>{t(title)}</h2>
      <p>{t("Saved sales for the selected period")}</p>
      <div
        className="bar-chart"
        role="img"
        aria-label={
          title + ": " + days.map((d, i) => d + " ₹" + values[i]).join(", ")
        }
      >
        {values.map((v, i) => (
          <div key={i}>
            <span className="bar-value">₹{(v / 1000).toFixed(1)}k</span>
            <span className="bar" style={{ height: (v / max) * 140 + 20 }} />
            <small>{days[i]}</small>
          </div>
        ))}
      </div>
    </Card>
  );
}
