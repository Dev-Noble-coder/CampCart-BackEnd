import express from "express";
import authorization from "../../middleware/middleware.js";
import { signup } from "./signup/index.js";
import {updateProfile} from "./userinfo/update.js"
import { login } from "./login/index.js";
import {userinfo} from "./userinfo/index.js"

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/auth/me",authorization,userinfo)
router.post("/users/profile",authorization,updateProfile)


export default router;
