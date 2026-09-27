"use client";
import { useEffect, useRef, useId } from "react";
import Icon from "./Icon";
export default function Modal({ title, children, onClose }) {
  const ref = useRef();
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={id}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <header>
        <h2 id={id}>{title}</h2>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <Icon name="X" />
        </button>
      </header>
      {children}
    </dialog>
  );
}
