import {
    CreateCategory,
    GetCategories,
} from "../controllers/CategoryController";
import { authenticate, authorizeRoles } from "../middleware/Auth";
import express from "express";

const router = express.Router();

router.get("/", GetCategories);
router.post("/", authenticate, authorizeRoles("ADMIN"), CreateCategory);

export default router;
