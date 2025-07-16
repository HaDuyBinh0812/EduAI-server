import express from "express";
import { authenticate, authorizeRoles } from "../middleware/Auth";
import {
    createQuiz,
    deleteQuiz,
    getQuizzesByLesson,
    submitAllAnswers,
} from "../controllers/QuizController";

const router = express.Router();

router.use(authenticate);

router.post("/", authorizeRoles("ADMIN"), createQuiz);
router.get("/:lessonId", getQuizzesByLesson);
router.delete("/:id", authorizeRoles("ADMIN"), deleteQuiz);
router.post("/submit", authenticate, submitAllAnswers);

export default router;
