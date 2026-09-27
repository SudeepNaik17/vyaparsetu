import DataTable from "@/components/ui/DataTable";
import StatusPill from "@/components/ui/StatusPill";
import Icon from "@/components/ui/Icon";
import { formatCurrency } from "@/utils/formatCurrency";
export default function SalesTable({ rows, onSelect }) {
  return (
    <DataTable
      columns={[
        "Bill #",
        "Customer",
        "Items",
        "Payment",
        "Amount",
        "Time",
        "Action",
      ]}
      rows={rows}
      render={(r) => (
        <>
          <td className="text-brand">
            <b>#{String(r.id).slice(-6).toUpperCase()}</b>
          </td>
          <td>{r.customer}</td>
          <td>{r.items}</td>
          <td>
            <StatusPill status={r.payment} />
          </td>
          <td>
            <b>{formatCurrency(r.amount)}</b>
          </td>
          <td>{r.time}</td>
          <td>
            <button
              className="icon-button"
              aria-label={"View bill " + r.id}
              onClick={() => onSelect(r)}
            >
              <Icon name="MoreVertical" size={17} />
            </button>
          </td>
        </>
      )}
    />
  );
}
