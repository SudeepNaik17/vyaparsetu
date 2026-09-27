import { Router } from "express";
import * as controller from "../controllers/product.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/", controller.listProducts);
router.post("/", controller.createProduct);
router.get("/:id", controller.getProduct);
router.patch("/:id", controller.updateProduct);
router.delete("/:id", controller.deleteProduct);
router.post("/:id/stock", controller.addStock);

export default router;
