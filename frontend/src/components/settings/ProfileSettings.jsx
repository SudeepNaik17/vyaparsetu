"use client";
import { useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useApp } from "@/context/AppContext";
import { useLanguage } from "@/hooks/useLanguage";
export default function ProfileSettings() {
  const { profile, setProfile, notify } = useApp();
  const { t } = useLanguage();
  const [edit, setEdit] = useState(false);
  return (
    <Card className="settings-card">
      <h2>{t("Profile & Business")}</h2>
      <form
        className="form-stack"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await setProfile(Object.fromEntries(new FormData(e.currentTarget)));
            setEdit(false);
            notify("Profile saved.");
          } catch (e) {
            notify(e.message);
          }
        }}
      >
        <Input
          label={t("Owner name")}
          name="owner"
          defaultValue={profile.owner}
          readOnly={!edit}
          required
        />
        <Input
          label={t("Business name")}
          name="business"
          defaultValue={profile.business}
          readOnly={!edit}
          required
        />
        <Input
          label={t("Mobile number")}
          name="mobile"
          defaultValue={profile.mobile}
          readOnly={!edit}
          pattern="[6-9][0-9]{9}"
          maxLength={10}
          required
        />
        {edit ? (
          <Button icon="Check">{t("Apply changes")}</Button>
        ) : (
          <Button
            type="button"
            icon="Pencil"
            variant="secondary"
            onClick={() => setEdit(true)}
          >
            {t("Edit profile")}
          </Button>
        )}
      </form>
    </Card>
  );
}
