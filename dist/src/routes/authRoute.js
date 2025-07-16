"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuthController_1 = require("../controllers/AuthController");
const Auth_1 = require("../middleware/Auth");
const router = express_1.default.Router();
router.post("/register", AuthController_1.Register);
router.post("/login", AuthController_1.Login);
router.post("/logout", AuthController_1.Logout);
router.get("/auth/me", Auth_1.authenticate, AuthController_1.GetCurrentUser);
exports.default = router;
