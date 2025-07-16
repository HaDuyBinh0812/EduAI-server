"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Auth_1 = require("../middleware/Auth");
const FavoriteController_1 = require("../controllers/FavoriteController");
const router = express_1.default.Router();
router.use(Auth_1.authenticate);
router.post("/", FavoriteController_1.toggleFavorite);
router.get("/", FavoriteController_1.getFavorites);
exports.default = router;
