import express from "express";
import { authenticate } from "../middleware/Auth";
import {
    createComment,
    deleteComment,
    getCommentsByLesson,
} from "../controllers/CommentController";

const router = express.Router();

router.use(authenticate);

router.post("/", createComment);
router.get("/:lessonId", getCommentsByLesson);
router.delete("/:id", deleteComment);

export default router;
