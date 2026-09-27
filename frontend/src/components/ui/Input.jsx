import { useId } from "react";
export default function Input({ label, className = "", ...props }) {
  const id = useId();
  return (
    <label className={"field " + className} htmlFor={id}>
      {label && <span>{label}</span>}
      <input id={id} {...props} />
    </label>
  );
}
