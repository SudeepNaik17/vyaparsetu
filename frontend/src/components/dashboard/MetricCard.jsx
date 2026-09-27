import Card from "@/components/ui/Card";
import { useLanguage } from "@/hooks/useLanguage";
export default function MetricCard({ label, value, note }) {
  const { t } = useLanguage();
  return (
    <Card className="metric">
      <span>{t(label)}</span>
      <strong>{value}</strong>
      <small>{t(note)}</small>
    </Card>
  );
}
