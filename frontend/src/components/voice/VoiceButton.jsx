import Icon from "@/components/ui/Icon";
export default function VoiceButton({ onClick, listening = false, disabled = false }) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={listening ? "Stop listening" : "Start voice entry"}
      className={"voice-button " + (listening ? "listening" : "")}
      onClick={onClick}
    >
      <Icon name="Mic" size={32} />
    </button>
  );
}
