import mongoose from "mongoose";
import Product from "../model/Product.model.js";
import Customer from "../model/Customer.model.js";
import Sales from "../model/sales.model.js";
import Udhaar from "../model/udhaar.model.js";
import { getShopOwnerId } from "../middlewares/auth.middleware.js";
import {
  number,
  fail,
  money,
  recordId,
  escapeRegex,
} from "../utils/validation.js";
import { transaction } from "../utils/transaction.js";
export async function listSales(user, query = {}) {
  const filter = { userId: getShopOwnerId(user) };
  if (query.customerId) filter.customerId = query.customerId;
  const sales = await Sales.find(filter)
    .populate("customerId", "name phone")
    .sort({ createdAt: -1 });
  return { sales, count: sales.length };
}
export async function quoteSale(user, data, session) {
  if (!Array.isArray(data.items) || !data.items.length) {
    if (data.productId) {
      data.items = [
        {
          productId: data.productId,
          quantity: data.quantity || 1,
          unitPrice: data.unitPrice ?? data.price,
          total: data.total,
        },
      ];
    } else if (data.item && typeof data.item === "object") {
      data.items = [data.item];
    }
  }
  if (
    !Array.isArray(data.items) ||
    !data.items.length ||
    data.items.length > 100
  )
    fail("Provide between 1 and 100 sale items");

  for (const item of data.items) {
    if (
      (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) &&
      (item.productName || item.name || item.productId)
    ) {
      const searchTerm = String(
        item.productName || item.name || item.productId,
      ).trim();
      const found = await Product.findOne({
        userId: getShopOwnerId(user),
        isActive: true,
        productName: { $regex: new RegExp(escapeRegex(searchTerm), "i") },
      }).session(session || null);
      if (found) item.productId = String(found._id);
    }
  }

  const ids = data.items.map((i) => recordId(i.productId));
  if (new Set(ids).size !== ids.length) fail("Duplicate products in sale");
  const products = await Product.find({
    _id: { $in: ids },
    userId: getShopOwnerId(user),
    isActive: true,
  }).session(session || null);
  if (products.length !== ids.length)
    fail("Product not found in your shop", 404);
  const map = new Map(products.map((p) => [String(p._id), p]));
  let subtotal = 0,
    cost = 0;
  const items = data.items.map((input) => {
    const p = map.get(String(input.productId));
    const quantity = number(input.quantity, "quantity", {
      min: 1,
      integer: true,
    });
    if (quantity > p.stockQuantity)
      fail("Insufficient stock for " + p.productName, 409);
    let unitPrice = input.unitPrice ?? input.price;
    if (unitPrice === undefined && input.total !== undefined && quantity > 0) {
      unitPrice = Number(input.total) / quantity;
    }
    if (
      unitPrice === undefined &&
      data.items.length === 1 &&
      data.total !== undefined &&
      quantity > 0
    ) {
      unitPrice = Number(data.total) / quantity;
    }
    if (unitPrice === undefined) {
      unitPrice = p.sellingPrice;
    }
    unitPrice = number(unitPrice, "unitPrice");
    const lineTotal = money(unitPrice * quantity);
    subtotal += lineTotal;
    cost += p.purchasePrice * quantity;
    return {
      productId: p._id,
      name: p.productName,
      quantity,
      unitPrice,
      unitCost: p.purchasePrice,
      lineTotal,
    };
  });
  subtotal = money(subtotal);
  const discount = number(data.discount ?? 0, "discount");
  if (discount > subtotal) fail("Discount exceeds subtotal");
  const total = money(subtotal - discount);
  const method = data.paymentMethod || "cash";
  if (!["cash", "upi", "card", "credit", "other"].includes(method))
    fail("Invalid payment method");
  const amountPaid = number(
    data.amountPaid ?? (method === "credit" ? 0 : total),
    "amountPaid",
  );
  if (amountPaid > total) fail("Payment exceeds total");
  const amountDue = money(total - amountPaid);

  let customer = null;
  let customerName = String(
    data.customerName || data.name || data.customer || "",
  ).trim();

  if (data.customerId) {
    if (mongoose.Types.ObjectId.isValid(data.customerId)) {
      customer = await Customer.findOne({
        _id: data.customerId,
        userId: getShopOwnerId(user),
        isActive: true,
      }).session(session || null);
      if (!customer) {
        // If not found by ID, it might be an orphaned/test ID or a name passed as customerId
        if (!customerName) customerName = String(data.customerId).trim();
      }
    } else if (!customerName) {
      customerName = String(data.customerId).trim();
    }
  }

  if (!customer && customerName) {
    customer = await Customer.findOne({
      name: { $regex: new RegExp(`^${escapeRegex(customerName)}$`, "i") },
      userId: getShopOwnerId(user),
      isActive: true,
    }).session(session || null);
  }

  if (amountDue && !customer && !customerName) {
    fail("Choose a customer for an unpaid sale");
  }

  return {
    items,
    subtotal,
    discount,
    total,
    amountPaid,
    amountDue,
    profit: money(total - cost),
    paymentMethod: method,
    customerId: customer?._id || null,
    customerName: customer?.name || customerName || null,
    notes: String(data.notes || "").slice(0, 1000),
  };
}
export async function createSale(user, data, existing) {
  return transaction(async (session) => {
    const quote = await quoteSale(user, data, session);
    for (const item of quote.items) {
      const result = await Product.updateOne(
        {
          _id: item.productId,
          userId: getShopOwnerId(user),
          isActive: true,
          stockQuantity: { $gte: item.quantity },
        },
        { $inc: { stockQuantity: -item.quantity } },
        { session },
      );
      if (!result.modifiedCount)
        fail("Stock changed. Please review again.", 409);
    }

    let customerId = quote.customerId;
    if (!customerId && quote.customerName) {
      let customer = await Customer.findOne({
        name: {
          $regex: new RegExp(`^${escapeRegex(quote.customerName)}$`, "i"),
        },
        userId: getShopOwnerId(user),
        isActive: true,
      }).session(session);

      if (!customer) {
        const [created] = await Customer.create(
          [
            {
              userId: getShopOwnerId(user),
              name: quote.customerName,
              phone: String(data.customerPhone || data.phone || "").trim(),
              isActive: true,
            },
          ],
          { session },
        );
        customer = created;
      }
      customerId = customer._id;
      quote.customerId = customerId;
    }

    const [sale] = await Sales.create(
      [
        {
          ...quote,
          customerId: customerId || null,
          userId: getShopOwnerId(user),
        },
      ],
      { session },
    );
    if (customerId) {
      await Customer.updateOne(
        { _id: customerId, userId: getShopOwnerId(user) },
        {
          $inc: {
            totalPurchases: quote.total,
            totalPaid: quote.amountPaid,
            totalDue: quote.amountDue,
          },
          $set: { lastPurchaseDate: new Date() },
        },
        { session },
      );
      if (quote.amountDue)
        await Udhaar.create(
          [
            {
              userId: getShopOwnerId(user),
              customerId,
              saleId: sale._id,
              amount: quote.amountDue,
              balance: quote.amountDue,
              paidAmount: 0,
              dueDate: data.dueDate || null,
              note: "Created from sale",
              status: "pending",
            },
          ],
          { session },
        );
    }
    return { sale };
  }, existing);
}
export async function todayProfit(user) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const rows = await Sales.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(getShopOwnerId(user)),
        createdAt: { $gte: start },
      },
    },
    {
      $group: {
        _id: null,
        sales: { $sum: "$total" },
        profit: { $sum: "$profit" },
        orders: { $sum: 1 },
      },
    },
  ]);
  return rows[0] || { sales: 0, profit: 0, orders: 0 };
}
