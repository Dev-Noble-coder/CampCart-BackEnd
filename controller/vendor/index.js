import express from "express";
import authorization from "../../middleware/middleware.js";
import { createProduct, getCatigory } from "./product/index.js";
import { signup } from "./signup/index.js";
import { userinfo } from "./vendorinfo/index.js";

const router = express.Router();
router.post("/signup", signup);
router.get("/auth/me", authorization, userinfo);
router.get('/getCatigotries',authorization,getCatigory)
router.post("/products", authorization, createProduct);

export default router;
