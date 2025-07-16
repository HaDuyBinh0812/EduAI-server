"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Auth_1 = require("../middleware/Auth");
const ProgressController_1 = require("../controllers/ProgressController");
const router = express_1.default.Router();
router.use(Auth_1.authenticate);
router.post("/", ProgressController_1.updateProgress);
router.get("/:courseId", ProgressController_1.getCourseProgress);
router.get("/:courseId/summary", ProgressController_1.getCourseProgressSummary);
router.get("/:courseId/last-viewed", ProgressController_1.getLastViewedLesson);
exports.default = router;
