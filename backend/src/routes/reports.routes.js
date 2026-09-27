import { Router } from "express";
import Product from "../model/Product.model.js";
import Sales from "../model/sales.model.js";
import Customer from "../model/Customer.model.js";
import Udhaar from "../model/udhaar.model.js";
import { protect, getShopOwnerId } from "../middlewares/auth.middleware.js";
const router = Router();
router.use(protect);
router.get("/", async (req, res) => {
  const owner = getShopOwnerId(req.user);
  const [products, sales, customers, udhaar] = await Promise.all([
    Product.find({ userId: owner, isActive: true }).lean(),
    Sales.find({ userId: owner })
      .populate("customerId", "name")
      .sort({ createdAt: -1 })
      .lean(),
    Customer.find({ userId: owner, isActive: true }).lean(),
    Udhaar.find({ userId: owner }).lean(),
  ]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySales = sales.filter((s) => s.createdAt >= today);
  const days = Number(req.query.days) === 30 ? 30 : 7;
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    return d;
  });
  const chart = dates.map((d) => {
    const end = new Date(d);
    end.setDate(end.getDate() + 1);
    const rows = sales.filter((s) => s.createdAt >= d && s.createdAt < end);
    return {
      date: d.toISOString(),
      sales: rows.reduce((a, s) => a + s.total, 0),
      profit: rows.reduce((a, s) => a + s.profit, 0),
    };
  });
  const period = sales.filter((s) => s.createdAt >= dates[0]);
  const byProduct = new Map();
  for (const sale of period)
    for (const item of sale.items) {
      const key = String(item.productId);
      const p = byProduct.get(key) || {
        name: item.name,
        quantity: 0,
        revenue: 0,
      };
      p.quantity += item.quantity;
      p.revenue += item.lineTotal;
      byProduct.set(key, p);
    }
  const methods = { cash: 0, upi: 0, credit: 0, card: 0, other: 0 };
  for (const sale of period) methods[sale.paymentMethod] += sale.total;
  res.json({
    success: true,
    summary: {
      sales: todaySales.reduce((a, s) => a + s.total, 0),
      profit: todaySales.reduce((a, s) => a + s.profit, 0),
      pending: udhaar.reduce((a, u) => a + u.balance, 0),
      inventory: products.reduce(
        (a, p) => a + p.purchasePrice * p.stockQuantity,
        0,
      ),
      products: products.length,
      customers: customers.length,
      orders: todaySales.length,
    },
    chart,
    topProducts: [...byProduct.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5),
    payments: methods,
    recent: sales.slice(0, 5).map((s) => ({
      id: s._id,
      customer: s.customerId?.name || "Walk-in",
      total: s.total,
      date: s.createdAt,
    })),
    notifications: products
      .filter((p) => p.stockQuantity <= p.lowStockLimit)
      .map((p) => ({
        id: p._id,
        title: "Low stock alert",
        detail: p.productName + " · " + p.stockQuantity + " remaining",
      })),
  });
});
export default router;
