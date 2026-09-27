import { useLanguage } from "@/hooks/useLanguage";
export default function PageHeader({ title, subtitle, children }) {
  const { t } = useLanguage();
  return (
    <div className="page-heading">
      <div>
        <h1>{t(title)}</h1>
        <p>{t(subtitle)}</p>
      </div>
      <div className="page-actions">{children}</div>
    </div>
  );
}
