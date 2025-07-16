import express from "express";
import { authenticate } from "../middleware/Auth";
import {
    getCourseProgress,
    getCourseProgressSummary,
    getLastViewedLesson,
    updateProgress,
} from "../controllers/ProgressController";

const router = express.Router();

router.use(authenticate);

router.post("/", updateProgress);
router.get("/:courseId", getCourseProgress);
router.get("/:courseId/summary", getCourseProgressSummary);
router.get("/:courseId/last-viewed", getLastViewedLesson);
export default router;
