"use client";
import { useState } from "react";
import Icon from "@/components/ui/Icon";
import EntryModal from "@/components/ui/EntryModal";
import { useLanguage } from "@/hooks/useLanguage";
export default function ManualEntryActions() {
  const [kind, setKind] = useState(null);
  const { t } = useLanguage();
  return (
    <section>
      <h2>{t("Manual entry")}</h2>
      <small>{t("Add an entry in a few taps.")}</small>
      <div className="manual-actions">
        {[
          ["sales", "ReceiptText", "Add Sale"],
          ["inventory", "Package", "Add Stock"],
          ["udhaar", "HandCoins", "Add Udhaar"],
        ].map(([key, icon, label]) => (
          <button key={key} onClick={() => setKind(key)}>
            <span>
              <Icon name={icon} />
            </span>
            {t(label)}
          </button>
        ))}
      </div>
      {kind && <EntryModal kind={kind} onClose={() => setKind(null)} />}
    </section>
  );
}
