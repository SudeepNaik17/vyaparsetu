import Card from "@/components/ui/Card";
import { languages } from "@/constants/languages";
import { useLanguage } from "@/hooks/useLanguage";
export default function LanguageSettings() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <Card className="settings-card">
      <h2>{t("Language")}</h2>
      <p>{t("Preferred language")}</p>
      <div className="segments">
        {languages.map((l) => (
          <button
            key={l.id}
            aria-pressed={language === l.id}
            className={language === l.id ? "active" : ""}
            onClick={() => setLanguage(l.id)}
          >
            {l.label}
          </button>
        ))}
      </div>
    </Card>
  );
}
