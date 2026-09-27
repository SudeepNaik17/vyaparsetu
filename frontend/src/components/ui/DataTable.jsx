import { useLanguage } from "@/hooks/useLanguage";
export default function DataTable({ columns, rows, render }) {
  const { t } = useLanguage();
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c}>{t(c)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>{render(row)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
