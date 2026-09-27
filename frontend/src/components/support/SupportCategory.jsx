import Icon from "@/components/ui/Icon";
import { useLanguage } from "@/hooks/useLanguage";
export default function SupportCategory({ value, onChange }) {
  const { t } = useLanguage();
  return (
    <section>
      <h2>{t("What do you need help with?")}</h2>
      <div className="support-categories">
        {[
          ["Voice AI", "Mic"],
          ["Sales", "ReceiptText"],
          ["Inventory", "Package"],
          ["Udhaar", "HandCoins"],
          ["Account", "UserRound"],
          ["Reports", "ChartNoAxesCombined"],
        ].map(([label, icon]) => (
          <button
            key={label}
            className={value === label ? "active" : ""}
            aria-pressed={value === label}
            onClick={() => onChange(label)}
          >
            <Icon name={icon} />
            {t(label)}
          </button>
        ))}
      </div>
    </section>
  );
}
