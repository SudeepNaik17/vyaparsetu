const date = (value) => (value ? String(value).slice(0, 10) : null);
export const product = (p) => ({
  id: p._id,
  name: p.productName,
  category: p.category,
  stock: p.stockQuantity,
  unit: p.productType || "Unit",
  price: p.sellingPrice,
  purchasePrice: p.purchasePrice,
  expiry: date(p.expiryDate),
  status: p.stockQuantity <= p.lowStockLimit ? "Low stock" : "In stock",
  art: /oil/i.test(p.productName)
    ? "oil"
    : /milk/i.test(p.productName)
      ? "milk"
      : /parle/i.test(p.productName)
        ? "parle"
        : /maggi/i.test(p.productName)
          ? "maggi"
          : /atta|आटा|ಹಿಟ್ಟು/i.test(p.productName)
            ? "atta"
            : "generic",
});
export const customer = (c) => ({
  id: c._id,
  name: c.name,
  mobile: c.phone || "",
  total: c.totalPurchases,
  pending: c.totalDue,
  status: "Active",
  address: c.address || "",
});
export const sale = (s) => ({
  id: s._id,
  customer: s.customerId?.name || "Walk-in",
  items: s.items.reduce((n, i) => n + i.quantity, 0),
  lines: s.items,
  payment: {
    cash: "Cash",
    upi: "UPI",
    credit: "Udhaar",
    card: "Card",
    other: "Other",
  }[s.paymentMethod],
  amount: s.total,
  paid: s.amountPaid,
  due: s.amountDue,
  profit: s.profit,
  time: new Date(s.createdAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }),
  date: new Date(s.createdAt).toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  }),
});
export const udhaar = (u) => ({
  id: u._id,
  name: u.customerId?.name || "Customer",
  mobile: u.customerId?.phone || "",
  amount: u.balance,
  originalAmount: u.amount,
  paidAmount: u.paidAmount,
  due: date(u.dueDate),
  status:
    u.balance === 0
      ? "Paid"
      : u.dueDate && new Date(u.dueDate) < new Date()
        ? "Overdue"
        : "Due soon",
});
