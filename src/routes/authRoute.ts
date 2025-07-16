import express from "express";
import {
    GetCurrentUser,
    Login,
    Logout,
    Register,
} from "../controllers/AuthController";
import { authenticate } from "../middleware/Auth";

const router = express.Router();

router.post("/register", Register);
router.post("/login", Login);
router.post("/logout", Logout);
router.get("/auth/me", authenticate, GetCurrentUser);
export default router;
