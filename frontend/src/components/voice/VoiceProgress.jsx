import Icon from "@/components/ui/Icon";
import { useLanguage } from "@/hooks/useLanguage";
export default function VoiceProgress({ step = 0 }) {
  const { t } = useLanguage();
  return (
    <ol className="voice-progress">
      {[
        ["Mic", "Speak"],
        ["AudioLines", "Review"],
        ["CheckCircle2", "Confirm"],
        ["Check", "Done"],
      ].map(([icon, label], i) => (
        <li
          key={label}
          className={i <= step ? "complete" : ""}
          aria-current={i === step ? "step" : undefined}
        >
          <span>
            <Icon name={icon} size={14} />
          </span>
          {t(label)}
        </li>
      ))}
    </ol>
  );
}
