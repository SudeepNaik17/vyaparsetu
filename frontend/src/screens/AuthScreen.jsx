"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Brand from "@/components/ui/Brand";
import StoreIllustration from "@/components/ui/StoreIllustration";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import { languages } from "@/constants/languages";
import { useLanguage } from "@/hooks/useLanguage";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { validMobile, validPin } from "@/utils/validators";
export default function AuthScreen({ mode }) {
  const register = mode === "register";
  const { language, setLanguage, t } = useLanguage();
  const { notify } = useApp();
  const { authenticate } = useAuth();
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    if (!validMobile(values.mobile) || !validPin(values.pin)) {
      setError(t("Enter a valid 10-digit mobile number and 4-digit PIN."));
      return;
    }
    setBusy(true);
    setError("");
    try {
      await authenticate(mode, { ...values, language });
      router.push("/home");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-page">
      <div className="auth-layout">
        <section className="auth-story">
          <Brand large />
          <div className="auth-intro">
            {register && <small>DUKAAN, AB AWAAZ SE</small>}
            <h1>
              {t(register ? "Set up your business" : "Welcome back")}{" "}
              {register ? "" : "👋"}
            </h1>
            <p>
              {t(
                register
                  ? "Sales, stock and credit — all in one place."
                  : "Log in to see how your business is doing.",
              )}
            </p>
          </div>
          <StoreIllustration />
        </section>
        <section className="auth-form-card">
          {register ? (
            <>
              <h2>{t("Create your account")}</h2>
              <p>{t("A new beginning for your business.")}</p>
            </>
          ) : (
            <div className="secure-banner">
              <span>
                <Icon name="ShieldCheck" size={24} />
              </span>
              <div>
                <b>{t("Safe & private access")}</b>
                <small>{t("Mobile and PIN protected account")}</small>
              </div>
            </div>
          )}
          <form className="form-stack" onSubmit={submit}>
            <Input
              label={t("Mobile number")}
              name="mobile"
              type="tel"
              inputMode="numeric"
              placeholder="98765 43210"
              pattern="[6-9][0-9]{9}"
              maxLength={10}
              required
            />
            {register && (
              <>
                <Input label={t("Owner name")} name="owner" required />
                <Input
                  label={t("Business name")}
                  name="business"
                  placeholder="Sharma General Store"
                  required
                />
                <div className="field">
                  <span>{t("Preferred language")}</span>
                  <div className="segments">
                    {languages.map((l) => (
                      <button
                        type="button"
                        key={l.id}
                        onClick={() => setLanguage(l.id)}
                        className={language === l.id ? "active" : ""}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            <Input
              label={t(register ? "Create 4-digit PIN" : "4-digit PIN")}
              name="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]{4}"
              minLength={4}
              maxLength={4}
              placeholder="••••"
              autoComplete="off"
              required
            />
            {register ? (
              <label className="terms">
                <input type="checkbox" required />
                <span>
                  {t("I agree to the")}{" "}
                  <button
                    type="button"
                    onClick={() => setInfo("Terms & Privacy")}
                  >
                    {t("Terms & Privacy Policy")}
                  </button>
                  .{" "}
                  {t(
                    "Your account and business records are stored securely on the server.",
                  )}
                </span>
              </label>
            ) : (
              <button
                type="button"
                className="text-button align-right"
                onClick={() => setInfo("Forgot PIN?")}
              >
                {t("Forgot PIN?")}
              </button>
            )}
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <Button icon="ArrowRight" disabled={busy}>
              {t(register ? "Create account" : "Login to VyaparSetu")}
            </Button>
          </form>
          {register ? (
            <p className="auth-switch">
              {t("Already registered?")} <Link href="/login">{t("Login")}</Link>
            </p>
          ) : (
            <>
              <div className="divider">{t("or")}</div>
              <Link className="button secondary" href="/register">
                {t("Create a new account")}
              </Link>
              <div className="language-helper">
                <Icon name="Languages" size={27} />
                <span>
                  {t("English, Hindi and Kannada — your app, your language.")}
                </span>
              </div>
            </>
          )}
        </section>
      </div>
      {info && (
        <Modal title={t(info)} onClose={() => setInfo(null)}>
          <p>
            {t(
              info === "Forgot PIN?"
                ? "Contact your shop administrator for account recovery. Automated PIN reset is not configured."
                : "Business records are saved in your configured database. Voice recordings and requested business context are sent to Groq for AI processing. Contact the shop operator for the applicable privacy policy.",
            )}
          </p>
          <Button onClick={() => setInfo(null)}>{t("Close")}</Button>
        </Modal>
      )}
    </main>
  );
}
