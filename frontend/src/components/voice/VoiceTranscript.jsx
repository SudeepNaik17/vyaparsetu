import { useLanguage } from "@/hooks/useLanguage";
import { useApp } from "@/context/AppContext";
import { replay } from "@/utils/voiceHelpers";
import { languages } from "@/constants/languages";
import Icon from "@/components/ui/Icon";
import VoiceWaveform from "./VoiceWaveform";
export default function VoiceTranscript({ text, language }) {
  const { t } = useLanguage();
  const { notify } = useApp();
  return (
    <section className="transcript">
      <div>
        <small>● {t("HEARD YOU")}</small>
        <button
          onClick={() => {
            if (!replay(text, language))
              notify(t("Audio playback is unavailable."));
          }}
        >
          <Icon name="Volume2" size={15} />
          {t("Replay")}
        </button>
      </div>
      <blockquote>“{text}”</blockquote>
      <small>
        {t("Detected Language")}:{" "}
        {languages.find((l) => l.id === language)?.name}
      </small>
      <VoiceWaveform />
    </section>
  );
}
