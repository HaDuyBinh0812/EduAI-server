import express from "express";
import multer from "multer";
import { upload } from "../middleware/upload";
import {
    createLesson,
    deleteLesson,
    getLessonsBySection,
    updateLessonOrder,
} from "../controllers/LessonController";
import { authenticate, authorizeRoles } from "../middleware/Auth";

const router = express.Router();

router.get("/:sectionId", getLessonsBySection);
router.post(
    "/",
    authenticate,
    authorizeRoles("ADMIN"),
    upload.single("video"),
    createLesson
);
router.patch("/:id", authenticate, authorizeRoles("ADMIN"), updateLessonOrder);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), deleteLesson);

export default router;
