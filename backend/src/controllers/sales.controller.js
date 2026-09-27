import * as sales from "../services/sales.service.js";

export const listSales = async (req, res) => {
  const result = await sales.listSales(req.user, req.query);
  res.json({ success: true, ...result });
};

export const createSale = async (req, res) => {
  const result = await sales.createSale(req.user, req.body);
  res.status(201).json({ success: true, ...result });
};

export const todayProfit = async (req, res) => {
  res.json({ success: true, ...(await sales.todayProfit(req.user)) });
};
