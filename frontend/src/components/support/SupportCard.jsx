import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import { useLanguage } from "@/hooks/useLanguage";
export default function SupportCard() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Card className="support-hero">
        <div>
          <span className="support-icon">
            <Icon name="Headphones" size={27} />
          </span>
          <span>
            <h2>{t("We are here to help.")}</h2>
            <p>{t("Get help in English, Hindi and Kannada.")}</p>
          </span>
        </div>
        <div className="action-row">
          <Button
            variant="secondary"
            icon="Phone"
            onClick={() => setOpen(true)}
          >
            {t("Call support")}
          </Button>
          <Button
            variant="ghost"
            icon="MessageCircle"
            onClick={() => setOpen(true)}
          >
            WhatsApp
          </Button>
        </div>
      </Card>
      {open && (
        <Modal title={t("Contact support")} onClose={() => setOpen(false)}>
          <p>
            {t(
              "Support contact details have not been configured. Use the form to preview your request.",
            )}
          </p>
          <Button onClick={() => setOpen(false)}>{t("Close")}</Button>
        </Modal>
      )}
    </>
  );
}
