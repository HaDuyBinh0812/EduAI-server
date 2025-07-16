"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const upload_1 = require("../middleware/upload");
const LessonController_1 = require("../controllers/LessonController");
const Auth_1 = require("../middleware/Auth");
const router = express_1.default.Router();
router.get("/:sectionId", LessonController_1.getLessonsBySection);
router.post("/", Auth_1.authenticate, (0, Auth_1.authorizeRoles)("ADMIN"), upload_1.upload.single("video"), LessonController_1.createLesson);
router.patch("/:id", Auth_1.authenticate, (0, Auth_1.authorizeRoles)("ADMIN"), LessonController_1.updateLessonOrder);
router.delete("/:id", Auth_1.authenticate, (0, Auth_1.authorizeRoles)("ADMIN"), LessonController_1.deleteLesson);
exports.default = router;
