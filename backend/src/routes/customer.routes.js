import { Router } from "express";
import * as controller from "../controllers/customer.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/", controller.listCustomers);
router.post("/", controller.createCustomer);
router.get("/:id", controller.getCustomer);
router.patch("/:id", controller.updateCustomer);

export default router;
