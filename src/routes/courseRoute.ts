import express from "express";
import {
    createCourse,
    getCourseDetail,
    getCourses,
} from "../controllers/CourseController";
import { authenticate, authorizeRoles } from "../middleware/Auth";
import { upload } from "../middleware/upload";

const router = express.Router();

router.get("/", getCourses);
router.get("/:slug", getCourseDetail);
router.post(
    "/",
    authenticate,
    authorizeRoles("ADMIN"),
    upload.single("thumbnail"),
    createCourse
);

export default router;
