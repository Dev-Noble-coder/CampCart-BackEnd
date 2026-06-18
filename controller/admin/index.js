import express from "express";
import authorization from "../../middleware/middleware.js";
import { signup } from "./signup/index.js";
import { admininfo } from "./admininfo/index.js";
import { createCategory, getCategory } from "./category/index.js";
import { getAgentOrders } from "./agent/index.js";

const router = express.Router();

router.post("/signup", signup);
router.get("/auth/me", authorization, admininfo);
router.post("/category", authorization, createCategory);
router.get("/category", getCategory);
router.get("/agents/:agentId/orders", authorization, getAgentOrders);

export default router;
