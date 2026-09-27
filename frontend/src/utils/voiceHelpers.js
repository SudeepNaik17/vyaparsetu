export const speechLocale = { en: "en-IN", hi: "hi-IN", kn: "kn-IN" };
export function replay(text, language = "en") {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLocale[language];
    window.speechSynthesis.speak(utterance);
    return true;
  }
  return false;
}
