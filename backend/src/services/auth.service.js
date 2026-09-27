import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/User.model.js";
import { fail, text, pick } from "../utils/validation.js";
export const safeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.tokenVersion;
  return obj;
};
const tokenFor = (user) =>
  jwt.sign(
    { userId: String(user._id), version: user.tokenVersion || 0 },
    process.env.JWT_SECRET,
    { expiresIn: "8h" },
  );
const mobile = (v) => {
  const p = String(v || "")
    .replace(/\s/g, "")
    .replace(/^\+91/, "");
  if (!/^[6-9]\d{9}$/.test(p)) fail("Enter a valid 10-digit mobile number");
  return p;
};
const pin = (v) => {
  if (!/^\d{4}$/.test(String(v || "")))
    fail("PIN must contain exactly 4 digits");
  return String(v);
};
export async function registerOwner(data) {
  const phone = mobile(data.mobile || data.phone);
  const secret = pin(data.pin || data.password);
  const name = text(data.name || data.owner, "Owner name");
  const shopName = text(data.business || data.shopName, "Business name");
  if (await User.exists({ phone }))
    fail("Mobile number already registered", 409);
  const user = await User.create({
    name,
    phone,
    shopName,
    password: await bcrypt.hash(secret, 12),
    role: "owner",
    settings: {
      language: ["en", "hi", "kn"].includes(data.language)
        ? data.language
        : "en",
    },
  });
  return { token: tokenFor(user), user: safeUser(user) };
}
export async function login(data) {
  const filter = data.email
    ? { email: text(data.email, "Email").toLowerCase() }
    : { phone: mobile(data.mobile || data.phone) };
  const user = await User.findOne(filter).select("+password");
  if (
    !user ||
    !(await bcrypt.compare(
      String(data.pin || data.password || ""),
      user.password,
    ))
  )
    fail("Invalid credentials", 401);
  return { token: tokenFor(user), user: safeUser(user) };
}
export async function updateProfile(user, data) {
  const patch = pick(data, ["name", "shopName"]);
  for (const k of Object.keys(patch)) patch[k] = text(patch[k], k);
  if (data.phone !== undefined) patch.phone = mobile(data.phone);
  return safeUser(
    await User.findByIdAndUpdate(
      user._id,
      { $set: patch },
      { new: true, runValidators: true },
    ),
  );
}
export async function updateSettings(user, data) {
  const patch = {};
  if (data.language !== undefined) {
    if (!["en", "hi", "kn"].includes(data.language)) fail("Invalid language");
    patch["settings.language"] = data.language;
  }
  if (data.theme !== undefined) {
    if (!["Light", "Dark", "System"].includes(data.theme))
      fail("Invalid theme");
    patch["settings.theme"] = data.theme;
  }
  if (data.notifications)
    for (const k of ["stock", "expiry", "udhaar", "summary"])
      if (data.notifications[k] !== undefined) {
        if (typeof data.notifications[k] !== "boolean")
          fail("Invalid notification preference");
        patch["settings.notifications." + k] = data.notifications[k];
      }
  return safeUser(
    await User.findByIdAndUpdate(
      user._id,
      { $set: patch },
      { new: true, runValidators: true },
    ),
  );
}
export async function changePin(user, data) {
  const record = await User.findById(user._id).select("+password");
  if (!(await bcrypt.compare(pin(data.currentPin), record.password)))
    fail("Current PIN is incorrect", 401);
  record.password = await bcrypt.hash(pin(data.newPin), 12);
  record.tokenVersion += 1;
  await record.save();
  return { token: tokenFor(record), user: safeUser(record) };
}
export const listWorkers = (owner) =>
  User.find({ role: "worker", ownerId: owner._id });
export async function createWorker(owner, data) {
  const worker = await User.create({
    name: text(data.name, "Name"),
    phone: mobile(data.phone),
    password: await bcrypt.hash(pin(data.pin), 12),
    role: "worker",
    ownerId: owner._id,
    shopName: owner.shopName,
  });
  return safeUser(worker);
}
