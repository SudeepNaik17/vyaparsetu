import Customer from "../model/Customer.model.js";
import { getShopOwnerId } from "../middlewares/auth.middleware.js";
import { pick, text, fail, escapeRegex } from "../utils/validation.js";
const filter = (user) => ({ userId: getShopOwnerId(user), isActive: true });
const clean = (data) => {
  const out = pick(data, ["name", "phone", "email", "address"]);
  if (out.name !== undefined) out.name = text(out.name, "Customer name");
  if (out.phone && !/^[6-9]\d{9}$/.test(out.phone))
    fail("Invalid customer mobile number");
  return out;
};
export async function listCustomers(user, query = {}) {
  const f = filter(user);
  if (query.search)
    f.$or = ["name", "phone"].map((k) => ({
      [k]: { $regex: escapeRegex(query.search), $options: "i" },
    }));
  return Customer.find(f).sort({ createdAt: -1 });
}
export async function createCustomer(user, data, session) {
  const input = clean(data);
  input.name = text(input.name, "Customer name");
  const [record] = await Customer.create(
    [{ ...input, userId: getShopOwnerId(user) }],
    { session },
  );
  return record;
}
export async function getCustomer(user, id, session) {
  const record = await Customer.findOne({ _id: id, ...filter(user) }).session(
    session || null,
  );
  if (!record) fail("Customer not found", 404);
  return record;
}
export async function updateCustomer(user, id, data) {
  const record = await getCustomer(user, id);
  Object.assign(record, clean(data));
  return record.save();
}
