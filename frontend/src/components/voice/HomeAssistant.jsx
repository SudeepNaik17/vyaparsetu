"use client";
import { useRef, useState } from "react";
import VoiceButton from "./VoiceButton";
import VoiceWaveform from "./VoiceWaveform";
import Button from "@/components/ui/Button";
import AIPreview from "@/screens/ai-preview";
import { useLanguage } from "@/hooks/useLanguage";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useApp } from "@/context/AppContext";
import { languages } from "@/constants/languages";
import { analyze } from "@/features/ai/ai.controller";

export default function HomeAssistant() {
  const { language, t } = useLanguage();
  const { draft, setDraft } = useApp();
  const [lang, setLang] = useState(language);
  const [text, setText] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const input = useRef(null);
  const review = useRef(null);
  const { listening, processing, error, start, stop } = useVoiceInput(lang, setText);
  const locked = listening || processing || busy;

  function edit(value) {
    setText(value);
    setExpanded(true);
    setFailure("");
    setDraft(null);
    requestAnimationFrame(() => input.current?.focus());
  }
  async function speak() {
    if (listening) { stop(); return; }
    setExpanded(true);
    setFailure("");
    setDraft(null);
    await start();
  }
  async function submit(event) {
    event.preventDefault();
    if (locked || !text.trim()) return;
    setBusy(true);
    setFailure("");
    try {
      const result = await analyze(text, lang);
      setDraft({ ...result, text, language: result.language || lang });
      setExpanded(false);
      requestAnimationFrame(() => review.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (e) {
      setFailure(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="home-assistant">
      <section className="voice-card">
        <div className="voice-card-top">
          <small>AI VOICE ASSISTANT</small>
          <span>{lang.toUpperCase()} · EN / HI / KN</span>
        </div>
        <h2>Bol ke business chalao.</h2>
        <p>{t("Sales, stock, udhaar — all in one place.")}</p>
        <VoiceButton listening={listening} disabled={processing || busy} onClick={speak} />
        <b role="status">{listening ? "Listening… tap to stop" : processing ? "Transcribing your voice…" : busy ? "Preparing your review…" : t("Tap and speak")}</b>
        <VoiceWaveform active={listening} />
        <small>{listening ? "Speak naturally. Recording stops after 60 seconds." : "Speak, review and save — right here."}</small>
        {!expanded && <button className="inline-type-button" onClick={() => edit("")}>Or type your entry</button>}
      </section>
      {expanded && (
        <section className="inline-entry" aria-label="Voice or text entry">
          <div className="segments">
            {languages.map((l) => <button key={l.id} disabled={locked} className={lang === l.id ? "active" : ""} onClick={() => setLang(l.id)}>{l.label}</button>)}
          </div>
          <form className="form-stack" onSubmit={submit}>
            <label className="field">
              <span>{text ? "Your entry — edit before reviewing" : t("Or type your entry")}</span>
              <textarea ref={input} value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={4000} disabled={locked} required placeholder="e.g. Add 10 packets of Maggi, purchase price ₹50, selling price ₹100." />
            </label>
            <small className="helper">Audio and relevant shop records are processed by Groq.</small>
            {(failure || error) && <p className="error" role="alert">{failure || error}</p>}
            <div className="action-row">
              <Button type="button" variant="secondary" disabled={locked} onClick={() => { setExpanded(false); setText(""); }}>Cancel</Button>
              <Button icon="ArrowRight" disabled={locked || !text.trim()}>{busy ? "Preparing review…" : "Review entry"}</Button>
            </div>
          </form>
        </section>
      )}
      {draft && !expanded && <div ref={review} className="home-review"><AIPreview onEdit={edit} /><Button variant="secondary" onClick={() => edit("")}>Start another entry</Button></div>}
    </div>
  );
}
