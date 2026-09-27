export default function VoiceWaveform({ active = false }) {
  return (
    <div className={"waveform" + (active ? " waveform-active" : "")} aria-hidden="true">
      {[
        6, 9, 7, 12, 6, 10, 15, 8, 5, 11, 7, 15, 20, 12, 8, 15, 10, 8, 14, 7, 5,
        10, 6, 9, 6, 12, 8, 5,
      ].map((h, i) => (
        <i key={i} style={{ height: h, animationDelay: `${i * -0.13}s`, animationDuration: `${0.55 + (i % 5) * 0.12}s` }} />
      ))}
    </div>
  );
}
