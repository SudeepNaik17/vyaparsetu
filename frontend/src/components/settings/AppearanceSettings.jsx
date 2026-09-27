import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { themes } from "@/constants/themes";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  return (
    <Card className="settings-card">
      <h2>{t("Appearance")}</h2>
      <p>{t("Choose how VyaparSetu looks on your device.")}</p>
      <div className="segments theme-options">
        {themes.map((v, i) => (
          <button
            key={v}
            aria-pressed={theme === v}
            className={theme === v ? "active" : ""}
            onClick={() => setTheme(v)}
          >
            <Icon name={["Sun", "Moon", "Monitor"][i]} />
            {t(v)}
          </button>
        ))}
      </div>
    </Card>
  );
}
