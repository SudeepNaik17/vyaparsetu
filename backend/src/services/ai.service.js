import https from "node:https";
import dns from "node:dns";
import mongoose from "mongoose";
import Groq, { toFile, APIConnectionError } from "groq-sdk";
import Product from "../model/Product.model.js";
import Customer from "../model/Customer.model.js";
import AIDraft from "../model/AIDraft.model.js";
import * as products from "./product.service.js";
import * as customers from "./customer.service.js";
import * as sales from "./sales.service.js";
import * as udhaar from "./udhaar.service.js";
import { getShopOwnerId } from "../middlewares/auth.middleware.js";
import { transaction } from "../utils/transaction.js";
import { text, number, fail, recordId } from "../utils/validation.js";

const httpAgent = new https.Agent({
  keepAlive: true,
  lookup: (hostname, options, callback) =>
    dns.lookup(hostname, { ...options, family: 4 }, callback),
});

const client = () => {
  if (!process.env.GROQ_API_KEY)
    fail("AI is not configured. Set GROQ_API_KEY on the backend.", 503);
  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
    timeout: 45000,
    maxRetries: 1,
    httpAgent,
  });
};
const actions = [
  "record_sale",
  "add_product",
  "add_stock",
  "create_customer",
  "create_udhaar",
  "answer",
];
export async function validatePlan(user, action, args) {
  if (!actions.includes(action)) fail("Unsupported AI action", 422);
  if (!args || typeof args !== "object" || Array.isArray(args))
    fail("Invalid AI arguments", 422);
  if (action === "record_sale") return sales.quoteSale(user, args);
  if (action === "add_stock") {
    const p = await products.getProduct(user, recordId(args.productId));
    return {
      product: p.productName,
      quantity: number(args.quantity, "quantity", { min: 1, integer: true }),
    };
  }
  if (action === "create_udhaar") {
    let customerName = args.customerName || args.name || args.customer;
    let customerId = args.customerId;
    if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
      const c = await Customer.findOne({
        _id: customerId,
        userId: getShopOwnerId(user),
        isActive: true,
      });
      if (c) customerName = c.name;
    }
    if (!customerName && !customerId) {
      fail("Customer is required for udhaar");
    }
    return {
      customerId: customerId || null,
      customer: customerName || String(customerId),
      amount: number(args.amount, "amount", { min: 0.01 }),
      dueDate: args.dueDate || null,
    };
  }
  if (action === "create_customer")
    return {
      name: text(args.name, "Customer name"),
      phone: args.phone || "",
      address: args.address || "",
    };
  if (action === "add_product")
    return {
      productName: text(args.productName, "Product name"),
      purchasePrice: number(args.purchasePrice, "purchase price"),
      sellingPrice: number(args.sellingPrice, "selling price"),
      stockQuantity: number(args.stockQuantity, "stock quantity", {
        integer: true,
      }),
    };
  return {};
}
export async function createDraft(user, plan) {
  const details = await validatePlan(user, plan.action, plan.args);
  const args =
    plan.action === "record_sale"
      ? {
          ...plan.args,
          items: details.items.map((i) => ({
            productId: String(i.productId),
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
          amountPaid: details.amountPaid,
          discount: details.discount,
          customerId: details.customerId
            ? String(details.customerId)
            : plan.args.customerId,
          customerName:
            details.customerName ||
            plan.args.customerName ||
            plan.args.customer ||
            plan.args.name ||
            undefined,
          customerPhone:
            plan.args.customerPhone || plan.args.phone || undefined,
        }
      : plan.action === "create_udhaar"
        ? {
            ...plan.args,
            customerId: details.customerId
              ? String(details.customerId)
              : plan.args.customerId,
            customerName:
              details.customer ||
              plan.args.customerName ||
              plan.args.name ||
              plan.args.customer,
            customerPhone:
              plan.args.customerPhone || plan.args.phone || undefined,
          }
        : plan.args;
  const draft = await AIDraft.create({
    userId: getShopOwnerId(user),
    actorId: user._id,
    action: plan.action,
    args,
    summary: String(plan.reply || "Please review this entry."),
    language: ["en", "hi", "kn"].includes(plan.language) ? plan.language : "en",
    expiresAt: new Date(Date.now() + 15 * 60000),
  });
  return {
    draftId: draft._id,
    action: draft.action,
    args: draft.args,
    details,
    reply: draft.summary,
    language: draft.language,
    expiresAt: draft.expiresAt,
  };
}
export async function chat(user, message, language = "en") {
  text(message, "Message", 4000);
  language = ["en", "hi", "kn"].includes(language) ? language : "en";
  const [inventory, people, profit] = await Promise.all([
    Product.find({ userId: getShopOwnerId(user), isActive: true })
      .limit(500)
      .lean(),
    Customer.find({ userId: getShopOwnerId(user), isActive: true })
      .limit(500)
      .select("name phone totalDue")
      .lean(),
    sales.todayProfit(user),
  ]);
  let response;
  try {
    response = await client().chat.completions.create({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are the intelligent bookkeeping assistant for VyaparSetu. You understand English, Hindi (Latin and Devanagari script), and Kannada. You must always reply in " +
            language +
            ". Your job is to interpret the user's intent into a structured business action. You propose ONE action; never claim a write has happened. Return valid JSON: { action, args, reply, language }. Supported actions: record_sale, add_product, add_stock, create_customer, create_udhaar, answer.\n" +
            "=== CRITICAL SALES AND PRICING RULES ===\n" +
            "1. When user mentions selling, placing an order, buying by a customer, giving goods, or recording a transaction (e.g. 'sell', 'sold', 'order', 'becho', 'bika', 'diya', 'maraata', 'sale'), you MUST ALWAYS choose action 'record_sale'. NEVER use 'answer' to question, confirm, or interrupt.\n" +
            "2. NEVER INTERRUPT ON PRICE: Never question or doubt the user's price, REGARDLESS OF HOW HIGH OR LOW IT IS (e.g. 40,000, 100,000, or 5). Even if catalog price is 200 and user says 40,000, ACCEPT THE USER'S STATED PRICE IMMEDIATELY.\n" +
            "3. If user provides a total price for item(s) (e.g. '2 atta for 40000', 'sold for 40000'), compute unitPrice = total / quantity. If stated per unit, use that unitPrice. If no price stated, use catalog sellingPrice. Never ask whether a price is per-unit or total; compute unitPrice and record immediately.\n" +
            "4. CUSTOMER AUTO-CREATION: If the order mentions a customer name:\n" +
            "   - If customer matches an existing customer in the provided 'customers' list, set customerId to their id and customerName to their name.\n" +
            "   - If customer DOES NOT exist in 'customers', DO NOT ASK TO CREATE THEM! Set customerName to the customer's name (and customerId to null). The backend will automatically create them!\n" +
            "   - Credit sales (udhaar) are 100% permitted for both existing customers and newly named customers.\n" +
            "5. Payment method defaults for record_sale: if credit/udhaar/unpaid/baaki mentioned, paymentMethod: 'credit', amountPaid: 0. Otherwise default paymentMethod: 'cash'. If upi/online/card mentioned, use that.\n" +
            "6. Match products to the provided inventory using the closest name match. Default quantity to 1 if not specified.\n" +
            "=== OTHER ACTIONS ===\n" +
            "- add_product: args={productName, purchasePrice, sellingPrice, stockQuantity, category?, productType?}\n" +
            "- add_stock: args={productId, quantity}\n" +
            "- create_customer: args={name, phone?, address?}\n" +
            "- create_udhaar: args={customerId?, customerName?, amount, dueDate?, note?}\n" +
            "- answer: Use ONLY for pure questions (e.g. 'how much profit today?'). NEVER use 'answer' when an order or sale was requested.\n" +
            "Keep reply concise and friendly in " +
            language +
            ".",
        },
        {
          role: "user",
          content: JSON.stringify({
            request: message,
            inventory: inventory.map((p) => ({
              id: String(p._id),
              name: p.productName,
              stock: p.stockQuantity,
              cost: p.purchasePrice,
              price: p.sellingPrice,
            })),
            customers: people.map((c) => ({
              id: String(c._id),
              name: c.name,
              due: c.totalDue,
            })),
            today: profit,
          }),
        },
      ],
    });
  } catch (e) {
    if (e.statusCode) throw e;
    if (e instanceof APIConnectionError)
      fail(
        "Cannot reach Groq. Check the backend outbound network connection.",
        503,
      );
    fail(
      e.status === 401
        ? "The Groq API key was rejected. Update the backend configuration."
        : e.status === 429
          ? "AI rate limit reached. Please try again shortly."
          : "AI provider could not process the request. Please retry.",
      e.status === 429 ? 429 : 502,
    );
  }
  let plan;
  try {
    plan = JSON.parse(response.choices?.[0]?.message?.content || "");
  } catch {
    fail("AI returned an invalid response. Please retry.", 502);
  }
  if (plan.action === "answer")
    return {
      reply: String(plan.reply || "Please provide more details."),
      language: ["en", "hi", "kn"].includes(plan.language)
        ? plan.language
        : language,
    };
  return createDraft(user, plan);
}
export async function confirm(user, id) {
  return transaction(async (session) => {
    const draft = await AIDraft.findOne({
      _id: id,
      userId: getShopOwnerId(user),
      actorId: user._id,
    }).session(session);
    if (!draft) fail("AI review not found", 404);
    if (draft.status === "confirmed")
      return { result: draft.result, alreadyConfirmed: true };
    if (draft.expiresAt < Date.now())
      fail("This review expired. Please review the entry again.", 409);
    let result;
    switch (draft.action) {
      case "record_sale":
        result = await sales.createSale(user, draft.args, session);
        break;
      case "add_product":
        result = await products.createProduct(user, draft.args, session);
        break;
      case "add_stock":
        result = await products.addStock(
          user,
          draft.args.productId,
          draft.args.quantity,
          session,
        );
        break;
      case "create_customer":
        result = await customers.createCustomer(user, draft.args, session);
        break;
      case "create_udhaar":
        result = await udhaar.createUdhaar(user, draft.args, session);
        break;
      default:
        fail("Unsupported action", 422);
    }
    draft.status = "confirmed";
    draft.result = JSON.parse(JSON.stringify(result));
    await draft.save({ session });
    return { result: draft.result, alreadyConfirmed: false };
  });
}
export async function transcribe(file, language) {
  try {
    const extension = {
      "audio/webm": "webm",
      "audio/ogg": "ogg",
      "audio/wav": "wav",
      "audio/x-wav": "wav",
      "audio/mpeg": "mp3",
      "audio/mp4": "m4a",
      "video/webm": "webm",
      "video/mp4": "mp4",
    }[file.mimetype.split(";")[0]];
    if (!extension) fail("Unsupported audio format", 415);
    const response = await client().audio.transcriptions.create({
      file: await toFile(file.buffer, "recording." + extension, {
        type: file.mimetype,
      }),
      model: process.env.GROQ_TRANSCRIBE_MODEL || "whisper-large-v3-turbo",
      language: ["en", "hi", "kn"].includes(language) ? language : undefined,
      response_format: "json",
      temperature: 0,
    });
    return response.text || "";
  } catch (e) {
    if (e.statusCode) throw e;
    if (e instanceof APIConnectionError)
      fail(
        "Cannot reach Groq for transcription. Check the backend network connection.",
        503,
      );
    fail("Audio transcription failed. Please retry or type your entry.", 502);
  }
}
