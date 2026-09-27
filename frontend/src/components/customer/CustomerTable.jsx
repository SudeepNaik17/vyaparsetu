import DataTable from "@/components/ui/DataTable";
import Avatar from "@/components/ui/Avatar";
import StatusPill from "@/components/ui/StatusPill";
import Icon from "@/components/ui/Icon";
import { formatCurrency } from "@/utils/formatCurrency";
export default function CustomerTable({ rows, onSelect }) {
  return (
    <DataTable
      columns={[
        "Name",
        "Mobile",
        "Total Purchases",
        "Pending",
        "Status",
        "Action",
      ]}
      rows={rows}
      render={(r) => (
        <>
          <td>
            <span className="person">
              <Avatar name={r.name} />
              {r.name}
            </span>
          </td>
          <td>+91 {r.mobile}</td>
          <td>
            <b>{formatCurrency(r.total)}</b>
          </td>
          <td className="text-brand">
            <b>{formatCurrency(r.pending)}</b>
          </td>
          <td>
            <StatusPill status={r.status} />
          </td>
          <td>
            <button
              className="icon-button"
              aria-label={"View " + r.name}
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
