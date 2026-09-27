export default function FilterChip({ active, children, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={"chip " + (active ? "active" : "")}
      {...props}
    >
      {children}
    </button>
  );
}
