"use client";
import { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import VoiceProgress from "@/components/voice/VoiceProgress";
import VoiceTranscript from "@/components/voice/VoiceTranscript";
import { useApp } from "@/context/AppContext";
import { useLanguage } from "@/hooks/useLanguage";
import { confirm } from "@/features/ai/ai.controller";
import { formatCurrency } from "@/utils/formatCurrency";
const labels = {
  record_sale: "Add Sale",
  add_product: "Add Product",
  add_stock: "Add Stock",
  create_customer: "Add Customer",
  create_udhaar: "Add Udhaar",
};
const fieldLabels = {
  customerName: "Customer",
  customer: "Customer",
  items: "Items",
  subtotal: "Subtotal",
  discount: "Discount",
  total: "Total",
  amountPaid: "Amount Paid",
  amountDue: "Amount Due",
  profit: "Profit",
  paymentMethod: "Payment Method",
  notes: "Notes",
  dueDate: "Due Date",
  product: "Product",
  productName: "Product Name",
  quantity: "Quantity",
  purchasePrice: "Purchase Price",
  sellingPrice: "Selling Price",
  stockQuantity: "Stock Quantity",
  phone: "Phone",
  address: "Address",
};
function Details({ draft }) {
  const { t } = useLanguage();
  const d = draft.details || {};
  return (
    <dl className="detail-list">
      {Object.entries(d)
        .filter(
          ([k, v]) =>
            !["customerId", "_id"].includes(k) &&
            v !== null &&
            v !== undefined &&
            v !== "",
        )
        .map(([key, value]) => (
          <div key={key}>
            <dt>{t(fieldLabels[key] || key)}</dt>
            <dd>
              {key === "items"
                ? value.map((i, n) => (
                    <p key={n}>
                      {i.name} · {i.quantity} × {formatCurrency(i.unitPrice)}
                    </p>
                  ))
                : [
                      "subtotal",
                      "total",
                      "profit",
                      "discount",
                      "amountPaid",
                      "amountDue",
                      "amount",
                      "purchasePrice",
                      "sellingPrice",
                    ].includes(key)
                  ? formatCurrency(value)
                  : String(value ?? "—")}
            </dd>
          </div>
        ))}
    </dl>
  );
}
export default function AIPreview({ onEdit }) {
  const { draft, setDraft, refresh, notify } = useApp();
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save() {
    setBusy(true);
    setError("");
    try {
      const result = await confirm(draft.draftId);
      setDraft({ ...draft, confirmed: true, result: result.result });
      refresh();
      notify("Entry saved successfully.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="ai-preview">
      <PageHeader title="Your AI entry" subtitle="Review before saving">
        <Badge>{draft?.confirmed ? "Saved" : "Review required"}</Badge>
      </PageHeader>
      {draft ? (
        <>
          <VoiceProgress step={draft.confirmed ? 3 : 1} />
          <VoiceTranscript text={draft.text} language={draft.language} />
          <Card className="parsed-card">
            <h2>
              {draft.confirmed
                ? "Entry saved"
                : t(labels[draft.action] || "AI response")}
            </h2>
            <p className="helper">{draft.reply}</p>
            {draft.draftId && <Details draft={draft} />}{" "}
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            {draft.confirmed ? (
              <Link
                className="button primary"
                href={
                  draft.action === "record_sale"
                    ? "/sales"
                    : draft.action === "create_customer"
                      ? "/customer"
                      : draft.action === "create_udhaar"
                        ? "/udhaar"
                        : "/inventory"
                }
              >
                View saved records
              </Link>
            ) : (
              <div className="action-row">
                <Button
                  variant="secondary"
                  icon="Pencil"
                  disabled={busy}
                  onClick={() => onEdit?.(draft?.text || "")}
                >
                  {draft.draftId ? "Edit request" : "Reply"}
                </Button>
                {draft.draftId && (
                  <Button icon="Check" disabled={busy} onClick={save}>
                    {busy ? "Saving…" : "Confirm & save"}
                  </Button>
                )}
              </div>
            )}
          </Card>
        </>
      ) : (
        <Card className="done-card">
          <h2>What would you like to do?</h2>
          <p>Speak or type an entry, or ask about your business.</p>
          <Button icon="Mic" onClick={() => onEdit?.("")}>
            Start an AI entry
          </Button>
        </Card>
      )}
    </div>
  );
}
