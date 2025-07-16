import express from "express";
import { authenticate } from "../middleware/Auth";
import {
    getFavorites,
    toggleFavorite,
} from "../controllers/FavoriteController";

const router = express.Router();

router.use(authenticate);

router.post("/", toggleFavorite);
router.get("/", getFavorites);

export default router;
