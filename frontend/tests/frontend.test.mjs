import test from "node:test";
import assert from "node:assert/strict";
import { validMobile, validPin } from "../src/utils/validators.js";
import { product, customer, sale, udhaar } from "../src/services/mappers.js";
import { apiClient, setToken } from "../src/services/apiClient.js";
import { isReviewable } from "../src/features/ai/aiParser.js";
import * as authApi from "../src/services/authApi.js";
import * as inventoryApi from "../src/services/inventoryApi.js";
import * as salesApi from "../src/services/salesApi.js";
import * as udhaarApi from "../src/services/udhaarApi.js";
import * as customerApi from "../src/services/customerApi.js";
import * as supportApi from "../src/services/supportApi.js";
import * as aiApi from "../src/services/aiApi.js";
import * as reportsApi from "../src/services/reportsApi.js";
import fs from "node:fs";
import path from "node:path";
test("mobile and PIN validation", () => {
  assert.equal(validMobile("9876543210"), true);
  assert.equal(validMobile("123"), false);
  assert.equal(validPin("1234"), true);
  assert.equal(validPin("abc"), false);
});
test("API adapters normalize actual database records", () => {
  const p = product({
    _id: "p",
    productName: "Rice",
    stockQuantity: 2,
    lowStockLimit: 5,
    sellingPrice: 60,
    purchasePrice: 40,
    expiryDate: null,
  });
  assert.equal(p.status, "Low stock");
  assert.equal(p.id, "p");
  assert.equal(p.expiry, null);
  const c = customer({
    _id: "c",
    name: "Customer",
    totalDue: 100,
    totalPurchases: 200,
  });
  assert.equal(c.pending, 100);
  const s = sale({
    _id: "s",
    customerId: { name: "Customer" },
    items: [{ quantity: 2 }],
    paymentMethod: "credit",
    total: 120,
    createdAt: "2026-09-26T10:00:00Z",
  });
  assert.equal(s.payment, "Udhaar");
  assert.equal(s.items, 2);
  const u = udhaar({
    _id: "u",
    customerId: { name: "Customer" },
    amount: 120,
    paidAmount: 20,
    balance: 100,
    dueDate: "2020-01-01",
  });
  assert.equal(u.status, "Overdue");
  assert.equal(u.amount, 100);
});
test("only a server-issued AI draft can be reviewed", () => {
  assert.equal(isReviewable({ reply: "hello" }), false);
  assert.equal(
    isReviewable({
      draftId: "id",
      action: "record_sale",
      args: {},
      expiresAt: "date",
    }),
    true,
  );
});
test("API client authenticates and surfaces server failures", async () => {
  const before = globalThis.fetch;
  globalThis.window = new EventTarget();
  let captured;
  try {
    setToken("test-token");
    globalThis.fetch = async (url, options) => {
      captured = { url, options };
      return new Response(JSON.stringify({ success: true, products: [] }), {
        status: 200,
      });
    };
    await apiClient("/products");
    assert.equal(captured.options.headers.Authorization, "Bearer test-token");
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({ success: false, message: "Insufficient stock" }),
        { status: 409 },
      );
    await assert.rejects(
      () => apiClient("/sales", { method: "POST", body: {} }),
      /Insufficient stock/,
    );
    let expired = false;
    window.addEventListener("session-expired", () => (expired = true));
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ message: "Expired" }), { status: 401 });
    await assert.rejects(() => apiClient("/products"), /Expired/);
    assert.equal(expired, true);
  } finally {
    globalThis.fetch = before;
    setToken(null);
    delete globalThis.window;
  }
});
test("frontend API wrappers match backend routes and methods", async () => {
  const before = globalThis.fetch;
  const requests = [];
  const productRecord = {
    _id: "p1",
    productName: "Rice",
    stockQuantity: 2,
    sellingPrice: 60,
    purchasePrice: 40,
  };
  const customerRecord = {
    _id: "c1",
    name: "Customer",
    totalPurchases: 0,
    totalDue: 0,
  };
  const saleRecord = {
    _id: "s1",
    customerId: null,
    items: [],
    paymentMethod: "cash",
    total: 0,
    createdAt: "2026-09-26T10:00:00Z",
  };
  const udhaarRecord = {
    _id: "u1",
    customerId: null,
    amount: 1,
    paidAmount: 0,
    balance: 1,
  };
  globalThis.fetch = async (url, options) => {
    requests.push([options.method, url]);
    if (url.endsWith("/attachment")) return new Response("file bytes");
    const body = {
      success: true,
      products: [productRecord],
      product: productRecord,
      customers: [customerRecord],
      customer: customerRecord,
      sales: [saleRecord],
      udhaar: url.endsWith("/u1") ? udhaarRecord : [udhaarRecord],
      ticket: { _id: "t1" },
      tickets: [],
      user: {},
      workers: [],
    };
    return new Response(JSON.stringify(body), { status: 200 });
  };
  setToken("contract-token");
  try {
    await authApi.register({});
    await authApi.login({});
    await authApi.profile();
    await authApi.updateProfile({});
    await authApi.settings({});
    await authApi.changePin({});
    await authApi.workers();
    await authApi.createWorker({});
    await inventoryApi.list();
    await inventoryApi.get("p1");
    await inventoryApi.submit({});
    await inventoryApi.update("p1", {});
    await inventoryApi.remove("p1");
    await inventoryApi.addStock("p1", 1);
    await salesApi.list();
    await salesApi.todayProfit();
    await salesApi.submit({});
    await udhaarApi.list();
    await udhaarApi.get("u1");
    await udhaarApi.submit({});
    await udhaarApi.pay("u1", 1);
    await customerApi.list();
    await customerApi.get("c1");
    await customerApi.submit({});
    await customerApi.update("c1", {});
    await supportApi.list();
    await supportApi.submit(new FormData());
    await supportApi.update("t1", {});
    assert.ok((await supportApi.attachment("t1")) instanceof Blob);
    await aiApi.chat("hello", "en");
    await aiApi.analyze("hello", "en");
    await aiApi.confirm("d1");
    await aiApi.transcribe(new Blob(["audio"], { type: "audio/webm" }), "en");
    await reportsApi.list(30);
    assert.deepEqual(requests, [
      ["POST", "/api/auth/register"],
      ["POST", "/api/auth/login"],
      ["GET", "/api/auth/profile"],
      ["PATCH", "/api/auth/profile"],
      ["PATCH", "/api/auth/settings"],
      ["POST", "/api/auth/pin"],
      ["GET", "/api/auth/workers"],
      ["POST", "/api/auth/workers"],
      ["GET", "/api/products"],
      ["GET", "/api/products/p1"],
      ["POST", "/api/products"],
      ["PATCH", "/api/products/p1"],
      ["DELETE", "/api/products/p1"],
      ["POST", "/api/products/p1/stock"],
      ["GET", "/api/sales"],
      ["GET", "/api/sales/today-profit"],
      ["POST", "/api/sales"],
      ["GET", "/api/udhaar"],
      ["GET", "/api/udhaar/u1"],
      ["POST", "/api/udhaar"],
      ["POST", "/api/udhaar/u1/pay"],
      ["GET", "/api/customers"],
      ["GET", "/api/customers/c1"],
      ["POST", "/api/customers"],
      ["PATCH", "/api/customers/c1"],
      ["GET", "/api/support"],
      ["POST", "/api/support"],
      ["PATCH", "/api/support/t1"],
      ["GET", "/api/support/t1/attachment"],
      ["POST", "/api/ai/chat"],
      ["POST", "/api/ai/preview"],
      ["POST", "/api/ai/drafts/d1/confirm"],
      ["POST", "/api/ai/transcribe"],
      ["GET", "/api/reports?days=30"],
    ]);
  } finally {
    globalThis.fetch = before;
    setToken(null);
  }
});
test("no persistent browser storage", () => {
  function scan(dir) {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .flatMap((f) =>
        f.isDirectory()
          ? scan(path.join(dir, f.name))
          : [path.join(dir, f.name)],
      );
  }
  for (const file of scan("src").filter((f) => /\.[jt]sx?$/.test(f)))
    assert.doesNotMatch(
      fs.readFileSync(file, "utf8"),
      /localStorage|sessionStorage|indexedDB|document\.cookie/i,
      file,
    );
});

test("API client explains unavailable backend and incorrect proxy responses", async () => {
  const before = globalThis.fetch;
  try {
    for (const status of [500, 502, 503, 504]) {
      globalThis.fetch = async () => new Response("Internal Server Error", { status });
      await assert.rejects(() => authApi.register({}), /Start the backend with npm run dev:local/);
    }
    globalThis.fetch = async () => new Response("<!doctype html><h1>Not found</h1>", { status: 404 });
    await assert.rejects(() => authApi.register({}), /Check BACKEND_URL/);
  } finally {
    globalThis.fetch = before;
  }
});
