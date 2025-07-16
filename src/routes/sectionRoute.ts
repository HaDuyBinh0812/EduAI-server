import express from "express";
import {
    createSection,
    deleteSection,
    getSectionsByCourse,
} from "../controllers/SectionController";
import { authenticate, authorizeRoles } from "../middleware/Auth";

const router = express.Router();

router.get("/:courseId", getSectionsByCourse);
router.post("/", authenticate, authorizeRoles("ADMIN"), createSection);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), deleteSection);

export default router;
