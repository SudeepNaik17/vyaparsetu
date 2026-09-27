export default function Avatar({ name }) {
  return (
    <span className="avatar">
      {name
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}
