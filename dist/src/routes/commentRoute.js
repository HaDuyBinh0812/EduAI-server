"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Auth_1 = require("../middleware/Auth");
const CommentController_1 = require("../controllers/CommentController");
const router = express_1.default.Router();
router.use(Auth_1.authenticate);
router.post("/", CommentController_1.createComment);
router.get("/:lessonId", CommentController_1.getCommentsByLesson);
router.delete("/:id", CommentController_1.deleteComment);
exports.default = router;
