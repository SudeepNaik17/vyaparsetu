import DataTable from "@/components/ui/DataTable";
import StatusPill from "@/components/ui/StatusPill";
import ProductArt from "@/components/ui/ProductArt";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
export default function InventoryTable({ rows }) {
  return (
    <DataTable
      columns={[
        "Product",
        "Category",
        "Stock",
        "Unit",
        "Price",
        "Expiry",
        "Status",
      ]}
      rows={rows}
      render={(r) => (
        <>
          <td>
            <span className="product-name">
              <ProductArt kind={r.art} />
              <b>{r.name}</b>
            </span>
          </td>
          <td>{r.category}</td>
          <td>{r.stock}</td>
          <td>{r.unit}</td>
          <td>{formatCurrency(r.price)}</td>
          <td>{formatDate(r.expiry)}</td>
          <td>
            <StatusPill status={r.status} />
          </td>
        </>
      )}
    />
  );
}
