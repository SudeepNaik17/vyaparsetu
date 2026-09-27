import DataTable from "@/components/ui/DataTable";
import Avatar from "@/components/ui/Avatar";
import StatusPill from "@/components/ui/StatusPill";
import Button from "@/components/ui/Button";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { useLanguage } from "@/hooks/useLanguage";
export default function UdhaarTable({ rows, onSelect }) {
  const { t } = useLanguage();
  return (
    <DataTable
      columns={["Customer", "Pending Amount", "Due Date", "Status", "Action"]}
      rows={rows}
      render={(r) => (
        <>
          <td>
            <span className="person">
              <Avatar name={r.name} />
              {r.name}
            </span>
          </td>
          <td className="text-brand">
            <b>{formatCurrency(r.amount)}</b>
          </td>
          <td>{formatDate(r.due)}</td>
          <td>
            <StatusPill status={r.status} />
          </td>
          <td>
            <Button
              className="small-button"
              variant={r.amount ? "primary" : "secondary"}
              onClick={() => onSelect(r)}
            >
              {t(r.amount ? "Record payment" : "View")}
            </Button>
          </td>
        </>
      )}
    />
  );
}
