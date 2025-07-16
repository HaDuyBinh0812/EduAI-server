"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const SectionController_1 = require("../controllers/SectionController");
const Auth_1 = require("../middleware/Auth");
const router = express_1.default.Router();
router.get("/:courseId", SectionController_1.getSectionsByCourse);
router.post("/", Auth_1.authenticate, (0, Auth_1.authorizeRoles)("ADMIN"), SectionController_1.createSection);
router.delete("/:id", Auth_1.authenticate, (0, Auth_1.authorizeRoles)("ADMIN"), SectionController_1.deleteSection);
exports.default = router;
