"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Auth_1 = require("../middleware/Auth");
const QuizController_1 = require("../controllers/QuizController");
const router = express_1.default.Router();
router.use(Auth_1.authenticate);
router.post("/", (0, Auth_1.authorizeRoles)("ADMIN"), QuizController_1.createQuiz);
router.get("/:lessonId", QuizController_1.getQuizzesByLesson);
router.delete("/:id", (0, Auth_1.authorizeRoles)("ADMIN"), QuizController_1.deleteQuiz);
router.post("/submit", Auth_1.authenticate, QuizController_1.submitAllAnswers);
exports.default = router;
