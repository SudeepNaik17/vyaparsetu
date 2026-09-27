import * as customer from "../services/customer.service.js";

export const listCustomers = async (req, res) => {
  const customers = await customer.listCustomers(req.user, req.query);
  res.json({ success: true, count: customers.length, customers });
};

export const createCustomer = async (req, res) => {
  res.status(201).json({
    success: true,
    customer: await customer.createCustomer(req.user, req.body),
  });
};

export const getCustomer = async (req, res) => {
  res.json({
    success: true,
    customer: await customer.getCustomer(req.user, req.params.id),
  });
};

export const updateCustomer = async (req, res) => {
  res.json({
    success: true,
    customer: await customer.updateCustomer(req.user, req.params.id, req.body),
  });
};
