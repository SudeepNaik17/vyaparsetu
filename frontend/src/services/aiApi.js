import { apiClient } from "./apiClient.js";
export const chat = (message, language) =>
  apiClient("/ai/chat", { method: "POST", body: { message, language } });
export const analyze = (message, language) =>
  apiClient("/ai/preview", { method: "POST", body: { message, language } });
export const confirm = (id) =>
  apiClient("/ai/drafts/" + id + "/confirm", { method: "POST", body: {} });
export async function transcribe(audio, language) {
  const body = new FormData();
  body.append(
    "audio",
    audio,
    "recording." + (audio.type.includes("mp4") ? "m4a" : "webm"),
  );
  body.append("language", language);
  return apiClient("/ai/transcribe", { method: "POST", body });
}
