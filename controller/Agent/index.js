import express from "express";
import { signup } from "./signup/index.js";
import { userinfo } from "./agentinfo/index.js";
import authorization from "../../middleware/middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.get("/agent-auth/me", authorization, userinfo);

export default router;
