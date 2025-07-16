"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CourseController_1 = require("../controllers/CourseController");
const Auth_1 = require("../middleware/Auth");
const upload_1 = require("../middleware/upload");
const router = express_1.default.Router();
router.get("/", CourseController_1.getCourses);
router.get("/:slug", CourseController_1.getCourseDetail);
router.post("/", Auth_1.authenticate, (0, Auth_1.authorizeRoles)("ADMIN"), upload_1.upload.single("thumbnail"), CourseController_1.createCourse);
exports.default = router;
