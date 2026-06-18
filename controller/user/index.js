import express from "express";
import authorization from "../../middleware/middleware.js";
import { signup } from "./signup/index.js";
import { updateProfile } from "./userinfo/update.js";
import { login, logout } from "./login/index.js";
import { userinfo } from "./userinfo/index.js";
import { forgotPassword, resetPassword } from "./password/index.js";
import { createOrder, getUserOrders, getOrderById } from "./order/index.js";
import { getWishlist, addToWishlist, removeFromWishlist } from "./wishlist/index.js";
import { becomeVendor } from "./becomeVendor/index.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/auth/logout", logout);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/reset-password/:token", resetPassword);
router.get("/auth/me", authorization, userinfo);
router.post("/users/profile", authorization, updateProfile);
router.post("/users/become-vendor", authorization, becomeVendor);

router.post("/orders", authorization, createOrder);
router.get("/orders", authorization, getUserOrders);
router.get("/orders/:id", authorization, getOrderById);

router.get("/wishlist", authorization, getWishlist);
router.post("/wishlist/add", authorization, addToWishlist);
router.delete("/wishlist/remove/:productId", authorization, removeFromWishlist);

export default router;
