import Icon from "./Icon";
import { useLanguage } from "@/hooks/useLanguage";
export default function Pagination({ page, total, pageSize = 5, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const { t } = useLanguage();
  return (
    <div className="pagination">
      <small>
        {t("Showing")} {total ? (page - 1) * pageSize + 1 : 0}–
        {Math.min(page * pageSize, total)} {t("of")} {total} {t("entries")}
      </small>
      <div>
        <button
          aria-label="Previous page"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
        >
          <Icon name="ChevronLeft" size={14} />
        </button>
        {Array.from({ length: pages }, (_, i) => (
          <button
            key={i}
            className={page === i + 1 ? "active" : ""}
            aria-current={page === i + 1 ? "page" : undefined}
            onClick={() => onChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          aria-label="Next page"
          disabled={page === pages}
          onClick={() => onChange(page + 1)}
        >
          <Icon name="ChevronRight" size={14} />
        </button>
      </div>
    </div>
  );
}
