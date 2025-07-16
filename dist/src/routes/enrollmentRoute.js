"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const EnrollmentController_1 = require("../controllers/EnrollmentController");
const Auth_1 = require("../middleware/Auth");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.post("/", Auth_1.authenticate, EnrollmentController_1.enrollCourse);
router.get("/:courseId", Auth_1.authenticate, EnrollmentController_1.checkEnrollment);
router.delete("/:courseId", Auth_1.authenticate, EnrollmentController_1.cancelEnrollment);
exports.default = router;
