"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import VoiceButton from "./VoiceButton";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useLanguage } from "@/hooks/useLanguage";
import { useApp } from "@/context/AppContext";
import { languages } from "@/constants/languages";
import { analyze } from "@/features/ai/ai.controller";
export const examples = {
  en: "Sell 2 packets of Aashirvaad Atta for ₹590 per packet, paid in cash.",
  hi: "आशीर्वाद आटा के 2 पैकेट ₹590 प्रति पैकेट नकद बेचो।",
  kn: "ಆಶೀರ್ವಾದ್ ಹಿಟ್ಟಿನ 2 ಪ್ಯಾಕೆಟ್‌ಗಳನ್ನು ಪ್ರತಿ ಪ್ಯಾಕೆಟ್‌ಗೆ ₹590 ನಗದಿಗೆ ಮಾರಾಟ ಮಾಡಿ.",
};
export default function VoiceEntryModal({
  kind = "sales",
  onClose,
  initialText = "",
}) {
  const { language, t } = useLanguage();
  const [lang, setLang] = useState(language);
  const [text, setText] = useState(initialText);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const { setDraft } = useApp();
  const router = useRouter();
  const { listening, processing, error, start, stop } = useVoiceInput(
    lang,
    setText,
  );
  return (
    <Modal title={t("Voice entry")} onClose={onClose}>
      <div className="voice-capture">
        <p>{t("Speak in your language. Review before confirming.")}</p>
        <div className="segments">
          {languages.map((l) => (
            <button
              key={l.id}
              disabled={listening || processing || busy}
              className={lang === l.id ? "active" : ""}
              onClick={() => setLang(l.id)}
            >
              {l.label}
            </button>
          ))}
        </div>
        {!processing && !busy && (
          <VoiceButton
            listening={listening}
            onClick={listening ? stop : start}
          />
        )}
        <p role="status">
          {listening
            ? "Recording… tap to stop"
            : processing
              ? "Transcribing with AI…"
              : busy
                ? "Preparing your review…"
                : t("Tap to speak")}
        </p>
        <small>Audio and relevant shop records are processed by Groq.</small>
        {(failure || error) && (
          <p className="error" role="alert">
            {failure || error}
          </p>
        )}
      </div>
      <form
        className="form-stack"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setFailure("");
          try {
            const result = await analyze(text, lang);
            setDraft({
              ...result,
              text,
              language: result.language || lang,
              kind,
            });
            onClose();
            router.push("/home");
          } catch (e) {
            setFailure(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="field">
          <span>{t("Or type your entry")}</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            rows={3}
            maxLength={4000}
            placeholder={examples[lang]}
            disabled={busy || listening || processing}
          />
        </label>
        <Button
          icon="ArrowRight"
          disabled={busy || listening || processing || !text.trim()}
        >
          {t("Review entry")}
        </Button>
      </form>
    </Modal>
  );
}
