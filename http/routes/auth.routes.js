import express from "express";
import { Register, Login, RefreshToken } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", Register);
router.post("/login", Login);
router.post("/refresh", RefreshToken);

export default router;
