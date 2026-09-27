import * as product from "../services/product.service.js";

export const listProducts = async (req, res) => {
  const products = await product.listProducts(req.user, req.query);
  res.json({ success: true, count: products.length, products });
};

export const createProduct = async (req, res) => {
  const result = await product.createProduct(req.user, req.body);
  res.status(201).json({ success: true, product: result });
};

export const getProduct = async (req, res) => {
  res.json({
    success: true,
    product: await product.getProduct(req.user, req.params.id),
  });
};

export const updateProduct = async (req, res) => {
  res.json({
    success: true,
    product: await product.updateProduct(req.user, req.params.id, req.body),
  });
};

export const deleteProduct = async (req, res) => {
  await product.deleteProduct(req.user, req.params.id);
  res.json({ success: true, message: "Product deleted" });
};

export const addStock = async (req, res) => {
  res.json({
    success: true,
    product: await product.addStock(req.user, req.params.id, req.body.quantity),
  });
};
