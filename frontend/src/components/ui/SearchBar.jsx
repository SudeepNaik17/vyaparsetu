import Icon from "./Icon";
export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  label,
}) {
  return (
    <div className="search">
      <Icon name="Search" size={16} />
      <input
        aria-label={label || placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Icon name="SlidersHorizontal" size={17} />
    </div>
  );
}
