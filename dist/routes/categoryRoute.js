"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CategoryController_1 = require("../controllers/CategoryController");
const Auth_1 = require("../middleware/Auth");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get("/", CategoryController_1.GetCategories);
router.post("/", Auth_1.authenticate, (0, Auth_1.authorizeRoles)("ADMIN"), CategoryController_1.CreateCategory);
exports.default = router;
