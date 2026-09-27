import Product from "../model/Product.model.js";
import { getShopOwnerId } from "../middlewares/auth.middleware.js";
import { pick, text, number, fail, escapeRegex } from "../utils/validation.js";
const ownerFilter = (user) => ({
  userId: getShopOwnerId(user),
  isActive: true,
});
const fields = [
  "productName",
  "purchasePrice",
  "sellingPrice",
  "stockQuantity",
  "lowStockLimit",
  "category",
  "productType",
  "expiryDate",
  "brand",
  "supplier",
];
export async function listProducts(user, query = {}) {
  const filter = ownerFilter(user);
  if (query.search)
    filter.productName = { $regex: escapeRegex(query.search), $options: "i" };
  if (query.category) filter.category = query.category;
  if (query.lowStock === "true")
    filter.$expr = { $lte: ["$stockQuantity", "$lowStockLimit"] };
  return Product.find(filter).sort({ createdAt: -1 });
}
function validate(data, partial = false) {
  const out = pick(data, fields);
  for (const key of ["productName", "purchasePrice", "sellingPrice"])
    if (!partial || out[key] !== undefined) {
      out[key] =
        key === "productName" ? text(out[key], key) : number(out[key], key);
    }
  for (const key of ["stockQuantity", "lowStockLimit"])
    if (out[key] !== undefined)
      out[key] = number(out[key], key, { integer: true });
  if (out.expiryDate === "") out.expiryDate = null;
  return out;
}
export async function createProduct(user, data, session) {
  const [record] = await Product.create(
    [{ ...validate(data), userId: getShopOwnerId(user) }],
    { session },
  );
  return record;
}
export async function getProduct(user, id, session) {
  const record = await Product.findOne({
    _id: id,
    ...ownerFilter(user),
  }).session(session || null);
  if (!record) fail("Product not found", 404);
  return record;
}
export async function updateProduct(user, id, data) {
  const product = await getProduct(user, id);
  Object.assign(product, validate(data, true));
  return product.save();
}
export async function deleteProduct(user, id) {
  const record = await getProduct(user, id);
  record.isActive = false;
  await record.save();
}
export async function addStock(user, id, quantity, session) {
  const amount = number(quantity, "quantity", { min: 1, integer: true });
  const record = await Product.findOneAndUpdate(
    { _id: id, ...ownerFilter(user) },
    { $inc: { stockQuantity: amount } },
    { new: true, session },
  );
  if (!record) fail("Product not found", 404);
  return record;
}
export const searchForAI = (user, search) => listProducts(user, { search });
