import { Router } from "express";
import * as controller from "../controllers/auth.controller.js";
import * as service from "../services/auth.service.js";
import { protect, requireOwner } from "../middlewares/auth.middleware.js";
import { rateLimit } from "../middlewares/rateLimit.js";
const router = Router();
router.post("/register", rateLimit(10, 600000), controller.register);
router.post("/login", rateLimit(15, 600000), controller.login);
router.get("/profile", protect, (req, res) =>
  res.json({ success: true, user: service.safeUser(req.user) }),
);
router.patch("/profile", protect, async (req, res) =>
  res.json({
    success: true,
    user: await service.updateProfile(req.user, req.body),
  }),
);
router.patch("/settings", protect, async (req, res) =>
  res.json({
    success: true,
    user: await service.updateSettings(req.user, req.body),
  }),
);
router.post("/pin", protect, rateLimit(10, 600000), async (req, res) =>
  res.json({ success: true, ...(await service.changePin(req.user, req.body)) }),
);
router.get("/workers", protect, requireOwner, controller.listWorkers);
router.post("/workers", protect, requireOwner, controller.createWorker);
export default router;
