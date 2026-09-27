import { useId } from "react";
export default function Select({ label, children, ...props }) {
  const id = useId();
  return (
    <label className="field" htmlFor={id}>
      {label && <span>{label}</span>}
      <select id={id} {...props}>
        {children}
      </select>
    </label>
  );
}
