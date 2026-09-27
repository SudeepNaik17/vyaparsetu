"use client";
import PageHeader from "@/components/ui/PageHeader";
import ProfileSettings from "@/components/settings/ProfileSettings";
import LanguageSettings from "@/components/settings/LanguageSettings";
import AppearanceSettings from "@/components/settings/AppearanceSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import { useLanguage } from "@/hooks/useLanguage";
export default function Settings() {
  const { t } = useLanguage();
  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your app preferences" />
      <div className="settings-grid">
        <div>
          <ProfileSettings />
          <LanguageSettings />
        </div>
        <div>
          <AppearanceSettings />
          <NotificationSettings />
          <SecuritySettings />
        </div>
      </div>
      <p className="helper">
        {t(
          "Preferences are saved to your account. Sign in again after refreshing.",
        )}
      </p>
    </>
  );
}
