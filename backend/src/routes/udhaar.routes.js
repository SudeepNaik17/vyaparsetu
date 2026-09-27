import { Router } from "express";
import * as controller from "../controllers/udhaar.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/", controller.listUdhaar);
router.post("/", controller.createUdhaar);
router.get("/:id", controller.getUdhaar);
router.post("/:id/pay", controller.payUdhaar);

export default router;
