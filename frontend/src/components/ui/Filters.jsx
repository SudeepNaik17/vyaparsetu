import FilterChip from "./FilterChip";
import { useLanguage } from "@/hooks/useLanguage";
export default function Filters({ options, value, onChange }) {
  const { t } = useLanguage();
  return (
    <div className="filters">
      {options.map((option) => (
        <FilterChip
          key={option}
          active={value === option}
          onClick={() => onChange(option)}
        >
          {t(option)}
        </FilterChip>
      ))}
    </div>
  );
}
