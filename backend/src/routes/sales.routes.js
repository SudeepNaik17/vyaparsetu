import { Router } from "express";
import * as controller from "../controllers/sales.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/", controller.listSales);
router.get("/today-profit", controller.todayProfit);
router.post("/", controller.createSale);

export default router;
