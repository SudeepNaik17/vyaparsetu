import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import crypto from "node:crypto";
import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import app from "../src/app.js";
import Product from "../src/model/Product.model.js";
import Customer from "../src/model/Customer.model.js";
import Sales from "../src/model/sales.model.js";
import User from "../src/model/User.model.js";
import AIDraft from "../src/model/AIDraft.model.js";
import { createDraft } from "../src/services/ai.service.js";

test("authenticated bookkeeping, isolation, transactions and AI confirmations", async (t) => {
  process.env.JWT_SECRET = crypto.randomBytes(48).toString("hex");
  process.env.MONGOMS_DOWNLOAD_DIR = path.resolve(".cache/mongodb");
  process.env.MONGOMS_PREFER_GLOBAL_PATH = "false";
  const repl = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: "wiredTiger" },
  });
  await mongoose.connect(repl.getUri("isolated_integration_test"));
  t.after(async () => {
    await mongoose.disconnect();
    await repl.stop();
  });
  await Promise.all([
    User.init(),
    Product.init(),
    Customer.init(),
    Sales.init(),
    AIDraft.init(),
  ]);
  const api = request(app);
  let token, other, product, customer, udhaar, sale;
  const call = (method, url, body, auth = token) => {
    let q = api[method](url);
    if (auth) q = q.set("Authorization", "Bearer " + auth);
    return body === undefined ? q : q.send(body);
  };
  await t.test("registration and mobile/PIN sign in", async () => {
    const r = await call("post", "/api/auth/register", {
      owner: "Test Owner",
      mobile: "9876543210",
      pin: "1234",
      business: "Isolated test shop",
      language: "hi",
    });
    assert.equal(r.status, 201, r.text);
    token = r.body.token;
    assert.equal(r.body.user.settings.language, "hi");
    assert.equal(r.body.user.password, undefined);
    const bad = await call(
      "post",
      "/api/auth/login",
      { mobile: "9876543210", pin: "0000" },
      null,
    );
    assert.equal(bad.status, 401);
    const login = await call(
      "post",
      "/api/auth/login",
      { mobile: "9876543210", pin: "1234" },
      null,
    );
    assert.equal(login.status, 200);
    const r2 = await call(
      "post",
      "/api/auth/register",
      {
        owner: "Other Owner",
        mobile: "9876543211",
        pin: "1234",
        business: "Other shop",
      },
      null,
    );
    other = r2.body.token;
    const unauthorized = await call("get", "/api/products", undefined, null);
    assert.equal(unauthorized.status, 401);
  });
  await t.test(
    "real products and customers, protected ownership fields",
    async () => {
      let r = await call("post", "/api/products", {
        productName: "Test Atta",
        purchasePrice: 40,
        sellingPrice: 60,
        stockQuantity: 10,
        category: "Staples",
      });
      assert.equal(r.status, 201, r.text);
      product = r.body.product;
      assert.equal(product.profitMargin, 33.33);
      r = await call("post", "/api/customers", {
        name: "Test Customer",
        phone: "9876543212",
        totalDue: 9999,
      });
      assert.equal(r.status, 201, r.text);
      customer = r.body.customer;
      assert.equal(customer.totalDue, 0);
      r = await call("get", "/api/products/" + product._id, undefined, other);
      assert.equal(r.status, 404);
      r = await call("patch", "/api/products/" + product._id, {
        userId: customer._id,
        stockQuantity: 10,
      });
      assert.equal(r.status, 200);
      assert.equal(r.body.product.userId, product.userId);
      r = await call("patch", "/api/customers/" + customer._id, {
        name: "Updated Customer",
        userId: product._id,
        totalDue: 500,
      });
      assert.equal(r.status, 200, r.text);
      assert.equal(r.body.customer.totalDue, 0);
      assert.equal(r.body.customer.userId, customer.userId);
    },
  );
  await t.test("cash sale defaults fully paid and reduces stock", async () => {
    const r = await call("post", "/api/sales", {
      items: [{ productId: product._id, quantity: 2 }],
      customerId: customer._id,
      paymentMethod: "cash",
    });
    assert.equal(r.status, 201, r.text);
    sale = r.body.sale;
    assert.equal(sale.total, 120);
    assert.equal(sale.profit, 40);
    assert.equal(sale.amountDue, 0);
    assert.equal((await Product.findById(product._id)).stockQuantity, 8);
  });
  await t.test("invalid sale leaves stock and balances unchanged", async () => {
    const before = await Sales.countDocuments();
    const r = await call("post", "/api/sales", {
      items: [{ productId: product._id, quantity: 1, unitPrice: -5 }],
    });
    assert.equal(r.status, 400);
    assert.equal(await Sales.countDocuments(), before);
    assert.equal((await Product.findById(product._id)).stockQuantity, 8);
  });
  await t.test(
    "credit sale and payment reconcile customer balance",
    async () => {
      let r = await call("post", "/api/sales", {
        items: [{ productId: product._id, quantity: 1 }],
        customerId: customer._id,
        paymentMethod: "credit",
      });
      assert.equal(r.status, 201, r.text);
      r = await call("get", "/api/udhaar");
      udhaar = r.body.udhaar[0];
      assert.equal(udhaar.balance, 60);
      r = await call("post", "/api/udhaar/" + udhaar._id + "/pay", {
        amount: 20,
      });
      assert.equal(r.status, 200, r.text);
      assert.equal(r.body.udhaar.balance, 40);
      assert.equal((await Customer.findById(customer._id)).totalDue, 40);
      r = await call("post", "/api/udhaar/" + udhaar._id + "/pay", {
        amount: 100,
      });
      assert.equal(r.status, 400);
      assert.equal((await Customer.findById(customer._id)).totalDue, 40);
    },
  );
  await t.test(
    "AI preview does not write; duplicate confirmations save once",
    async () => {
      const user = await User.findOne({ phone: "9876543210" });
      const before = await Sales.countDocuments();
      const draft = await createDraft(user, {
        action: "record_sale",
        args: {
          items: [{ productId: product._id, quantity: 1 }],
          paymentMethod: "cash",
        },
        reply: "Review sale",
        language: "en",
      });
      assert.equal(await Sales.countDocuments(), before);
      const responses = await Promise.all([
        call("post", "/api/ai/drafts/" + draft.draftId + "/confirm", {}),
        call("post", "/api/ai/drafts/" + draft.draftId + "/confirm", {}),
      ]);
      for (const r of responses) assert.equal(r.status, 200, r.text);
      assert.equal(await Sales.countDocuments(), before + 1);
      assert.equal((await Product.findById(product._id)).stockQuantity, 6);
      const denied = await call(
        "post",
        "/api/ai/drafts/" + draft.draftId + "/confirm",
        {},
        other,
      );
      assert.equal(denied.status, 404);
    },
  );
  await t.test("AI confirmation revalidates stock and expiry", async () => {
    const user = await User.findOne({ phone: "9876543210" });
    const draft = await createDraft(user, {
      action: "add_stock",
      args: { productId: product._id, quantity: 2 },
      reply: "Review",
      language: "en",
    });
    await AIDraft.updateOne(
      { _id: draft.draftId },
      { $set: { expiresAt: new Date(0) } },
    );
    const r = await call(
      "post",
      "/api/ai/drafts/" + draft.draftId + "/confirm",
      {},
    );
    assert.equal(r.status, 409);
    assert.equal((await Product.findById(product._id)).stockQuantity, 6);
  });
  await t.test("concurrent sales cannot oversell", async () => {
    const r = await call("post", "/api/products", {
      productName: "Only one",
      purchasePrice: 1,
      sellingPrice: 2,
      stockQuantity: 1,
    });
    const id = r.body.product._id;
    const results = await Promise.all([
      call("post", "/api/sales", { items: [{ productId: id, quantity: 1 }] }),
      call("post", "/api/sales", { items: [{ productId: id, quantity: 1 }] }),
    ]);
    assert.deepEqual(results.map((r) => r.status).sort(), [201, 409]);
    assert.equal((await Product.findById(id)).stockQuantity, 0);
  });
  await t.test(
    "all AI write types are scoped and require confirmation",
    async () => {
      const user = await User.findOne({ phone: "9876543210" });
      for (const [action, args] of [
        [
          "add_product",
          {
            productName: "AI product",
            purchasePrice: 10,
            sellingPrice: 15,
            stockQuantity: 4,
          },
        ],
        ["add_stock", { productId: product._id, quantity: 2 }],
        ["create_customer", { name: "AI customer", phone: "9876543222" }],
        ["create_udhaar", { customerId: customer._id, amount: 5 }],
      ]) {
        const draft = await createDraft(user, {
          action,
          args,
          reply: "Review",
          language: "kn",
        });
        const r = await call(
          "post",
          "/api/ai/drafts/" + draft.draftId + "/confirm",
          {},
        );
        assert.equal(r.status, 200, r.text);
      }
      assert.equal((await Customer.findById(customer._id)).totalDue, 45);
      const invalid = await call("post", "/api/ai/transcribe", {});
      assert.equal(invalid.status, 400);
    },
  );
  await t.test(
    "profile, settings, support attachments and reports persist",
    async () => {
      let r = await call("patch", "/api/auth/settings", {
        theme: "Dark",
        language: "kn",
        notifications: { stock: false },
      });
      assert.equal(r.status, 200);
      assert.equal(r.body.user.settings.theme, "Dark");
      assert.equal(r.body.user.settings.notifications.stock, false);
      r = await call("patch", "/api/auth/profile", { name: "Saved Owner" });
      assert.equal(r.body.user.name, "Saved Owner");
      r = await api
        .post("/api/support")
        .set("Authorization", "Bearer " + token)
        .field("subject", "Test issue")
        .field("message", "Synthetic test attachment")
        .attach("attachment", Buffer.from([137, 80, 78, 71]), {
          filename: "test.png",
          contentType: "image/png",
        });
      assert.equal(r.status, 201, r.text);
      const ticket = r.body.ticket._id;
      const attachment = await call(
        "get",
        "/api/support/" + ticket + "/attachment",
      );
      assert.equal(attachment.status, 200);
      assert.equal(attachment.body.length, 4);
      r = await call("get", "/api/reports");
      assert.equal(r.status, 200);
      assert.equal(r.body.summary.pending, 45);
      assert.ok(r.body.summary.sales > 0);
      assert.equal(r.body.chart.length, 7);
    },
  );
  await t.test("PIN changes invalidate previous tokens", async () => {
    const old = token;
    const r = await call("post", "/api/auth/pin", {
      currentPin: "1234",
      newPin: "5678",
    });
    assert.equal(r.status, 200, r.text);
    token = r.body.token;
    assert.equal(
      (await call("get", "/api/auth/profile", undefined, old)).status,
      401,
    );
    assert.equal((await call("get", "/api/auth/profile")).status, 200);
  });
});
