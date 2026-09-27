"use client";
import { useState } from "react";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import { pay } from "@/services/udhaarApi";
import { useApp } from "@/context/AppContext";
import { formatCurrency } from "@/utils/formatCurrency";
export default function PaymentModal({ record, onClose }) {
  const { refresh, notify } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <Modal title="Record payment" onClose={onClose}>
      <p>
        {record.name} · Outstanding {formatCurrency(record.amount)}
      </p>
      <form
        className="form-stack"
        onSubmit={async (e) => {
          e.preventDefault();
          const amount = Number(new FormData(e.currentTarget).get("amount"));
          setBusy(true);
          setError("");
          try {
            await pay(record.id, amount);
            refresh();
            notify("Payment recorded.");
            onClose();
          } catch (e) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Input
          label="Amount received"
          name="amount"
          type="number"
          min="0.01"
          max={record.amount}
          step="0.01"
          required
        />
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <Button disabled={busy}>Confirm payment</Button>
      </form>
    </Modal>
  );
}
