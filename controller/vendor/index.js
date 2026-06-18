import express from "express";
import authorization, { checkRole } from "../../middleware/middleware.js";
import { createProduct, getCatigory, getProduct, getProductById, updateProduct, deleteProduct } from "./product/index.js";
import { getVendorOrders, getOrderById as getVendorOrderById, updateOrderStatus } from "./order/index.js";

import { userinfo } from "./vendorinfo/index.js";
import { updateVendorProfile, getVendorDashboardStats } from "./profile/index.js";

const router = express.Router();

router.get("/auth/me", authorization, userinfo);
router.get('/getCatigotries',authorization,getCatigory)
router.post("/products", authorization, checkRole(["vendor"]), createProduct);
router.get("/products", authorization, checkRole(["vendor"]), getProduct);
router.get("/products/:id", authorization, checkRole(["vendor"]), getProductById);
router.put("/products/:id", authorization, checkRole(["vendor"]), updateProduct);
router.delete("/products/:id", authorization, checkRole(["vendor"]), deleteProduct);

router.get("/orders", authorization, checkRole(["vendor"]), getVendorOrders);
router.get("/orders/:id", authorization, checkRole(["vendor"]), getVendorOrderById);
router.put("/orders/:id/status", authorization, checkRole(["vendor"]), updateOrderStatus);

router.put("/profile", authorization, checkRole(["vendor"]), updateVendorProfile);
router.get("/dashboard", authorization, checkRole(["vendor"]), getVendorDashboardStats);

export default router;
