import {
    cancelEnrollment,
    checkEnrollment,
    enrollCourse,
} from "../controllers/EnrollmentController";
import { authenticate } from "../middleware/Auth";
import express from "express";

const router = express.Router();

router.post("/", authenticate, enrollCourse);
router.get("/:courseId", authenticate, checkEnrollment);
router.delete("/:courseId", authenticate, cancelEnrollment);

export default router;
