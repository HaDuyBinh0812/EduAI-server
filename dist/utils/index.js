"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyToken = exports.SignToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
const SignToken = (payload, expiresIn = "7d") => {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        expiresIn: expiresIn, // 👈 fix TypeScript type conflict
    });
};
exports.SignToken = SignToken;
const VerifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
};
exports.VerifyToken = VerifyToken;
