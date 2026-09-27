"use client";
import { useRef, useState, useEffect } from "react";
import { transcribe } from "@/services/aiApi";
export function useVoiceInput(language, onResult) {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const recorder = useRef(null),
    stream = useRef(null),
    timer = useRef(null),
    mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
      if (recorder.current?.state === "recording") recorder.current.stop();
      stream.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);
  async function start() {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError(
        "Audio recording is unavailable in this browser. Type your entry below.",
      );
      return;
    }
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mounted.current) {
        media.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = media;
      const type = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find(
        (t) => MediaRecorder.isTypeSupported(t),
      );
      const r = new MediaRecorder(media, type ? { mimeType: type } : undefined);
      recorder.current = r;
      const chunks = [];
      r.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      r.onstop = async () => {
        clearTimeout(timer.current);
        media.getTracks().forEach((t) => t.stop());
        if (!mounted.current) return;
        setListening(false);
        setProcessing(true);
        try {
          const audio = new Blob(chunks, { type: r.mimeType });
          if (!audio.size)
            throw new Error("No audio was captured. Please try again.");
          const result = await transcribe(audio, language);
          if (mounted.current) onResult(result.text);
        } catch (e) {
          if (mounted.current) setError(e.message);
        } finally {
          if (mounted.current) setProcessing(false);
        }
      };
      r.start();
      setListening(true);
      timer.current = setTimeout(() => {
        if (r.state === "recording") r.stop();
      }, 60000);
    } catch {
      stream.current?.getTracks().forEach((t) => t.stop());
      setError(
        "Microphone permission is required. You can type your entry instead.",
      );
    }
  }
  function stop() {
    if (recorder.current?.state === "recording") recorder.current.stop();
  }
  return { listening, processing, error, start, stop };
}
