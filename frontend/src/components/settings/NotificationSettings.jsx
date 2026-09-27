import { useApp } from "@/context/AppContext";
import Card from "@/components/ui/Card";
import Toggle from "@/components/ui/Toggle";
import { useNotifications } from "@/hooks/useNotifications";
import { useLanguage } from "@/hooks/useLanguage";
export default function NotificationSettings() {
  const { notifications, setNotifications } = useNotifications();
  const { notify } = useApp();
  const { t } = useLanguage();
  return (
    <Card className="settings-card">
      <h2>{t("Notifications")}</h2>
      {[
        ["stock", "Low stock alerts"],
        ["expiry", "Expiry alerts"],
        ["udhaar", "Udhaar reminders"],
        ["summary", "Daily business summary"],
      ].map(([key, label]) => (
        <Toggle
          key={key}
          label={t(label)}
          checked={notifications[key]}
          onChange={(value) =>
            setNotifications({ [key]: value }).catch((e) => notify(e.message))
          }
        />
      ))}
    </Card>
  );
}
