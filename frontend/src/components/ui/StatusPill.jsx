import Badge from "./Badge";
import { statuses } from "@/constants/statuses";
import { useLanguage } from "@/hooks/useLanguage";
export default function StatusPill({ status }) {
  const { t } = useLanguage();
  return <Badge tone={statuses[status] || "warm"}>{t(status)}</Badge>;
}
