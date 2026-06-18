import express from "express";
import { signup } from "./signup/index.js";
import { userinfo } from "./agentinfo/index.js";
import authorization, { checkRole } from "../../middleware/middleware.js";
import { getAvailableOrders, acceptOrder, getAssignedOrders, updateDeliveryStatus } from "./order/index.js";

const router = express.Router();

router.post("/signup", signup);
router.get("/auth/me", authorization, userinfo);

router.get("/orders/available", authorization, checkRole(["agent", "deliveryAgent"]), getAvailableOrders);
router.put("/orders/:id/accept", authorization, checkRole(["agent", "deliveryAgent"]), acceptOrder);
router.get("/orders/assigned", authorization, checkRole(["agent", "deliveryAgent"]), getAssignedOrders);
router.put("/orders/:id/status", authorization, checkRole(["agent", "deliveryAgent"]), updateDeliveryStatus);

export default router;
