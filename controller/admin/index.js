import express from "express";
import authorization from "../../middleware/middleware.js";
import { signup } from "./signup/index.js";
import { admininfo } from "./admininfo/index.js";
import { createCategory, getCategory } from "./category/index.js";
import { getAgentOrders } from "./agent/index.js";
import { getPlatformInsights } from "./dashboard/index.js";
import { getUsersList, updateUserStatus } from "./users/index.js";
import { getPlatformOrders } from "./orders/index.js";
import { getPlatformProducts, deleteProductAdmin } from "./products/index.js";

const router = express.Router();

router.post("/signup", signup);
router.get("/auth/me", authorization, admininfo);
router.post("/category", authorization, createCategory);
router.get("/category", getCategory);
router.get("/agents/:agentId/orders", authorization, getAgentOrders);

// Dashboard
router.get("/dashboard/insights", authorization, getPlatformInsights);

// Users Management
router.get("/users", authorization, getUsersList);
router.put("/users/:id/status", authorization, updateUserStatus);

// Orders Management
router.get("/orders", authorization, getPlatformOrders);

// Products Management
router.get("/products", authorization, getPlatformProducts);
router.delete("/products/:id", authorization, deleteProductAdmin);

export default router;
