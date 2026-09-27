"use client";
import { useState } from "react";
import Modal from "./Modal";
import Input from "./Input";
import Select from "./Select";
import Button from "./Button";
import { useApp } from "@/context/AppContext";
import { useLanguage } from "@/hooks/useLanguage";
import { submit as inventory, addStock } from "@/services/inventoryApi";
import { submit as sales } from "@/services/salesApi";
import { submit as udhaar } from "@/services/udhaarApi";
import { submit as customer } from "@/services/customerApi";
export default function EntryModal({ kind, onClose, initial }) {
  const { data, refresh, notify } = useApp();
  const { t } = useLanguage();
  const [review, setReview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [productId, setProductId] = useState(
    initial?.id || data.inventory[0]?.id || "",
  );
  const [stockMode, setStockMode] = useState(!!initial);
  const [method, setMethod] = useState("cash");
  const [price, setPrice] = useState(
    initial?.price || data.inventory[0]?.price || "",
  );
  const title = {
    inventory: "Add Product",
    sales: "Add Sale",
    udhaar: "Add Udhaar",
    customer: "Add Customer",
  }[kind];
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (review.stockMode) await addStock(review.productId, review.quantity);
      else await { inventory, sales, udhaar, customer }[kind](review.payload);
      refresh();
      notify("Entry saved successfully.");
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  function prepare(e) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    let payload = values;
    if (kind === "inventory") {
      payload = stockMode
        ? {}
        : {
            productName: values.productName,
            category: values.category,
            productType: values.productType,
            purchasePrice: Number(values.purchasePrice),
            sellingPrice: Number(values.sellingPrice),
            stockQuantity: Number(values.stockQuantity),
            lowStockLimit: Number(values.lowStockLimit),
            expiryDate: values.expiryDate || null,
          };
    }
    if (kind === "sales")
      payload = {
        customerId: values.customerId || undefined,
        items: [
          {
            productId: values.productId,
            quantity: Number(values.quantity),
            unitPrice: Number(values.unitPrice),
          },
        ],
        paymentMethod: values.paymentMethod,
        discount: 0,
      };
    if (kind === "udhaar")
      payload = {
        customerId: values.customerId,
        amount: Number(values.amount),
        dueDate: values.dueDate || null,
        note: values.note,
      };
    setReview({
      payload,
      values,
      stockMode: kind === "inventory" && stockMode,
      productId,
      quantity: Number(values.quantity),
    });
  }
  const productOptions = data.inventory.map((p) => (
    <option key={p.id} value={p.id}>
      {p.name} · {p.stock} in stock
    </option>
  ));
  return (
    <Modal title={t(title)} onClose={onClose}>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {review ? (
        <form onSubmit={save}>
          <p className="notice">{t("Review before saving")}</p>
          <dl className="detail-list">
            {Object.entries(review.values).map(([key, value]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>
                  {key === "productId"
                    ? data.inventory.find((p) => p.id === value)?.name
                    : key === "customerId"
                      ? data.customer.find((c) => c.id === value)?.name ||
                        "Walk-in"
                      : value || "—"}
                </dd>
              </div>
            ))}
          </dl>
          <div className="action-row">
            <Button
              variant="secondary"
              type="button"
              disabled={busy}
              onClick={() => setReview(null)}
            >
              {t("Edit")}
            </Button>
            <Button disabled={busy} icon="Check">
              {busy ? "Saving…" : "Confirm & save"}
            </Button>
          </div>
        </form>
      ) : (
        <form className="form-stack" onSubmit={prepare}>
          {kind === "inventory" ? (
            <>
              <div className="segments">
                <button
                  type="button"
                  className={!stockMode ? "active" : ""}
                  onClick={() => setStockMode(false)}
                >
                  New product
                </button>
                <button
                  type="button"
                  className={stockMode ? "active" : ""}
                  onClick={() => setStockMode(true)}
                >
                  Add stock
                </button>
              </div>
              {stockMode ? (
                <>
                  <Select
                    label="Product"
                    name="productId"
                    required
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                  >
                    <option value="" disabled>
                      Select a product
                    </option>
                    {productOptions}
                  </Select>
                  <Input
                    label="Quantity to add"
                    name="quantity"
                    type="number"
                    min="1"
                    step="1"
                    required
                  />
                </>
              ) : (
                <>
                  <Input label={t("Product")} name="productName" required />
                  <Select label={t("Category")} name="category">
                    {[
                      "Staples",
                      "Oil",
                      "Dairy",
                      "Biscuits",
                      "Snacks",
                      "Other",
                    ].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </Select>
                  <div className="form-grid">
                    <Input
                      label="Purchase price"
                      name="purchasePrice"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                    />
                    <Input
                      label="Selling price"
                      name="sellingPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="form-grid">
                    <Input
                      label={t("Stock")}
                      name="stockQuantity"
                      type="number"
                      min="0"
                      step="1"
                      defaultValue="0"
                      required
                    />
                    <Input
                      label="Low stock threshold"
                      name="lowStockLimit"
                      type="number"
                      min="0"
                      step="1"
                      defaultValue="5"
                      required
                    />
                  </div>
                  <Select label={t("Unit")} name="productType">
                    {["Bag", "Bottle", "Packet", "Pack", "Kg", "Unit"].map(
                      (x) => (
                        <option key={x}>{x}</option>
                      ),
                    )}
                  </Select>
                  <Input label={t("Expiry")} name="expiryDate" type="date" />
                </>
              )}
            </>
          ) : kind === "customer" ? (
            <>
              <Input label={t("Customer name")} name="name" required />
              <Input
                label={t("Mobile number")}
                name="phone"
                pattern="[6-9][0-9]{9}"
                inputMode="tel"
                maxLength={10}
              />
              <Input label={t("Address")} name="address" />
            </>
          ) : (
            <>
              <Select
                label={t("Customer")}
                name="customerId"
                required={kind === "udhaar" || method === "credit"}
                defaultValue=""
              >
                <option value="">
                  {kind === "sales" && method !== "credit"
                    ? "Walk-in"
                    : "Select a customer"}
                </option>
                {data.customer.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} · {c.mobile}
                  </option>
                ))}
              </Select>
              {kind === "sales" ? (
                <>
                  <Select
                    label={t("Product")}
                    name="productId"
                    value={productId}
                    onChange={(e) => {
                      setProductId(e.target.value);
                      setPrice(
                        data.inventory.find((p) => p.id === e.target.value)
                          ?.price || 0,
                      );
                    }}
                    required
                  >
                    <option value="" disabled>
                      Select a product
                    </option>
                    {productOptions}
                  </Select>
                  <div className="form-grid">
                    <Input
                      label={t("Quantity")}
                      name="quantity"
                      type="number"
                      min="1"
                      step="1"
                      required
                      defaultValue="1"
                    />
                    <Input
                      label="Unit selling price"
                      name="unitPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                  <Select
                    label={t("Payment method")}
                    name="paymentMethod"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="credit">Udhaar</option>
                  </Select>
                  <p className="helper">
                    Cash and UPI sales are fully paid. Udhaar creates an unpaid
                    balance for the selected customer.
                  </p>
                </>
              ) : (
                <>
                  <Input
                    label={t("Amount")}
                    name="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                  />
                  <Input label={t("Due Date")} name="dueDate" type="date" />
                  <Input label="Note" name="note" />
                </>
              )}
            </>
          )}
          <Button icon="ArrowRight">{t("Review entry")}</Button>
        </form>
      )}
    </Modal>
  );
}
