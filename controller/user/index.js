import express from "express";
import { signup } from "./signup/index.js";
import { login } from "./login/index.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

export default router;
