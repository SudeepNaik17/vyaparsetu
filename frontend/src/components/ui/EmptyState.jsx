import Icon from "./Icon";
export default function EmptyState({
  title = "No results found",
  detail = "Try a different search or filter.",
}) {
  return (
    <div className="empty">
      <Icon name="Search" size={28} />
      <h3>{title}</h3>
      <p>{detail}</p>
    </div>
  );
}
