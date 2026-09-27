import * as auth from "../services/auth.service.js";

export const register = async (req, res) => {
  const result = await auth.registerOwner(req.body);
  res.status(201).json({ success: true, ...result });
};

export const login = async (req, res) => {
  const result = await auth.login(req.body);
  res.json({ success: true, ...result });
};

export const profile = async (req, res) => {
  res.json({ success: true, user: req.user });
};

export const listWorkers = async (req, res) => {
  res.json({ success: true, workers: await auth.listWorkers(req.user) });
};

export const createWorker = async (req, res) => {
  const worker = await auth.createWorker(req.user, req.body);
  res.status(201).json({ success: true, worker });
};
