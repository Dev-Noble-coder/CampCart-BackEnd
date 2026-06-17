import express from "express";
import authorization from "../../middleware/middleware.js";
import { createProduct } from "./product/index.js";
import { signup } from "./signup/index.js";

const router = express.Router();
router.post("/signup", signup);
router.post("/vendor/products", authorization, createProduct);

export default router;
