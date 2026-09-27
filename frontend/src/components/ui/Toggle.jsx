export default function Toggle({ label, checked, onChange }) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span aria-hidden="true" className="toggle-track" />
    </label>
  );
}
