import mongoose from "mongoose";
import Udhaar from "../model/udhaar.model.js";
import Customer from "../model/Customer.model.js";
import { getShopOwnerId } from "../middlewares/auth.middleware.js";
import {
  number,
  fail,
  money,
  recordId,
  escapeRegex,
} from "../utils/validation.js";
import { transaction } from "../utils/transaction.js";
export async function listUdhaar(user, query = {}) {
  const filter = { userId: getShopOwnerId(user) };
  if (query.customerId) filter.customerId = query.customerId;
  return Udhaar.find(filter)
    .populate("customerId", "name phone totalDue")
    .sort({ createdAt: -1 });
}
export async function createUdhaar(user, data, existing) {
  return transaction(async (session) => {
    const amount = money(number(data.amount, "amount", { min: 0.01 }));
    let customer = null;
    let candidateName = String(
      data.customerName || data.name || data.customer || "",
    ).trim();

    if (data.customerId) {
      if (mongoose.Types.ObjectId.isValid(data.customerId)) {
        customer = await Customer.findOne({
          _id: data.customerId,
          userId: getShopOwnerId(user),
          isActive: true,
        }).session(session);
        if (!customer && !candidateName) {
          candidateName = String(data.customerId).trim();
        }
      } else if (!candidateName) {
        candidateName = String(data.customerId).trim();
      }
    }

    if (!customer && candidateName) {
      customer = await Customer.findOne({
        name: { $regex: new RegExp(`^${escapeRegex(candidateName)}$`, "i") },
        userId: getShopOwnerId(user),
        isActive: true,
      }).session(session);

      if (!customer) {
        const [created] = await Customer.create(
          [
            {
              userId: getShopOwnerId(user),
              name: candidateName,
              phone: String(data.phone || data.customerPhone || "").trim(),
              isActive: true,
            },
          ],
          { session },
        );
        customer = created;
      }
    }

    if (!customer) fail("Customer not found", 404);
    const [record] = await Udhaar.create(
      [
        {
          userId: getShopOwnerId(user),
          customerId: customer._id,
          amount,
          balance: amount,
          paidAmount: 0,
          note: String(data.note || "").slice(0, 1000),
          dueDate: data.dueDate || null,
          status: "pending",
        },
      ],
      { session },
    );
    await Customer.updateOne(
      { _id: customer._id },
      { $inc: { totalDue: amount } },
      { session },
    );
    return record;
  }, existing);
}
export async function getUdhaar(user, id) {
  const record = await Udhaar.findOne({
    _id: id,
    userId: getShopOwnerId(user),
  }).populate("customerId", "name phone totalDue");
  if (!record) fail("Udhaar not found", 404);
  return record;
}
export async function payUdhaar(user, id, data, existing) {
  return transaction(async (session) => {
    const amount = money(number(data.amount, "payment", { min: 0.01 }));
    const record = await Udhaar.findOne({
      _id: id,
      userId: getShopOwnerId(user),
    }).session(session);
    if (!record) fail("Udhaar not found", 404);
    if (amount > record.balance) fail("Payment exceeds balance");
    record.balance = money(record.balance - amount);
    record.paidAmount = money(record.paidAmount + amount);
    record.status = record.balance === 0 ? "paid" : "partial";
    record.payments.push({
      amount,
      note: String(data.note || "").slice(0, 1000),
    });
    await record.save({ session });
    await Customer.updateOne(
      { _id: record.customerId, userId: getShopOwnerId(user) },
      { $inc: { totalDue: -amount, totalPaid: amount } },
      { session },
    );
    return record;
  }, existing);
}
