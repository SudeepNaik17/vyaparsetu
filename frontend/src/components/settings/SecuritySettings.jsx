"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Icon from "@/components/ui/Icon";
import { useApp } from "@/context/AppContext";
import { useLanguage } from "@/hooks/useLanguage";
export default function SecuritySettings() {
  const [panel, setPanel] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { notify, logout, changePin } = useApp();
  const router = useRouter();
  const { t } = useLanguage();
  return (
    <Card className="settings-card">
      <h2>{t("Security")}</h2>
      <button
        className="settings-row"
        onClick={() => setPanel("Change 4-digit PIN")}
      >
        <Icon name="LockKeyhole" />
        {t("Change 4-digit PIN")}
        <Icon name="ChevronRight" />
      </button>
      <button
        className="settings-row"
        onClick={() => setPanel("Privacy & Security")}
      >
        <Icon name="ShieldCheck" />
        {t("Privacy & Security")}
        <Icon name="ChevronRight" />
      </button>
      <button
        className="settings-row text-brand"
        onClick={() => {
          logout();
          router.replace("/login");
        }}
      >
        <Icon name="LogOut" />
        {t("Logout")}
      </button>
      {panel && (
        <Modal title={t(panel)} onClose={() => setPanel(null)}>
          {panel === "Privacy & Security" ? (
            <p>
              Business data and preferences are saved in your MongoDB database.
              Your sign-in token stays in memory and is cleared on refresh. AI
              requests send the necessary shop context and voice audio to Groq.
            </p>
          ) : (
            <form
              className="form-stack"
              onSubmit={async (e) => {
                e.preventDefault();
                const values = Object.fromEntries(
                  new FormData(e.currentTarget),
                );
                setBusy(true);
                setError("");
                try {
                  await changePin(values);
                  notify("PIN changed. Other sessions have been invalidated.");
                  setPanel(null);
                } catch (e) {
                  setError(e.message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Input
                label={t("Current PIN")}
                name="currentPin"
                type="password"
                pattern="[0-9]{4}"
                maxLength={4}
                inputMode="numeric"
                required
              />
              <Input
                label={t("New 4-digit PIN")}
                name="newPin"
                type="password"
                pattern="[0-9]{4}"
                maxLength={4}
                inputMode="numeric"
                required
              />
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              <Button disabled={busy}>Save PIN</Button>
            </form>
          )}
        </Modal>
      )}
    </Card>
  );
}
