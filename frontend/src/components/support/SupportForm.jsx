"use client";
import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { submit, list } from "@/services/supportApi";
import { useApp } from "@/context/AppContext";
import { useLanguage } from "@/hooks/useLanguage";
export default function SupportForm({ category }) {
  const { notify } = useApp();
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [tickets, setTickets] = useState([]);
  useEffect(() => {
    list()
      .then((r) => setTickets(r.tickets))
      .catch((e) => setError(e.message));
  }, []);
  return (
    <section>
      <h2>{t("Tell us the issue")}</h2>
      <form
        className="form-stack support-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const data = new FormData(form);
          data.set("category", category);
          if (!data.get("attachment")?.size) data.delete("attachment");
          setBusy(true);
          setError("");
          try {
            const response = await submit(data);
            notify("Support ticket saved: " + response.ticket._id.slice(-6));
            form.reset();
            setTickets((await list()).tickets);
          } catch (e) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Input label={t("Subject")} name="subject" maxLength={200} required />
        <label className="field">
          <span>{t("Details")}</span>
          <textarea name="message" rows={4} maxLength={5000} required />
        </label>
        <Input
          label="Screenshot or audio (maximum 5 MB)"
          name="attachment"
          type="file"
          accept="image/png,image/jpeg,image/webp,audio/*"
        />
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <Button icon="ArrowRight" disabled={busy}>
          {busy ? "Submitting…" : "Submit support request"}
        </Button>
      </form>
      <h3 style={{ marginTop: 20 }}>Your support requests</h3>
      {tickets.map((ticket) => (
        <div className="notification-row" key={ticket._id}>
          <b>{ticket.subject}</b>
          <p>{ticket.status}</p>
        </div>
      ))}
    </section>
  );
}
