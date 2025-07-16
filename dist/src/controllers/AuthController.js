"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCurrentUser = exports.Logout = exports.Login = exports.Register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const __1 = require("..");
const utils_1 = require("../utils");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, name, password } = req.body;
    try {
        const existingUser = yield __1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email đã tồn tại" });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = yield __1.prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: "USER",
            },
        });
        const token = (0, utils_1.SignToken)({
            userId: user.id,
            role: user.role,
            email: user.email,
        });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax", // hoặc "none" nếu FE/BE khác domain
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        })
            .status(201)
            .json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.Register = Register;
const Login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield __1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "Email hoặc mật khẩu sai" });
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Email hoặc mật khẩu sai" });
        }
        const token = (0, utils_1.SignToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
            .status(200)
            .json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.Login = Login;
const Logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    })
        .status(200)
        .json({ message: "Đăng xuất thành công" });
};
exports.Logout = Logout;
const GetCurrentUser = (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Chưa đăng nhập" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        res.status(200).json({
            user: {
                id: decoded.userId,
                email: decoded.email,
                role: decoded.role,
            },
        });
    }
    catch (error) {
        res.status(401).json({ message: "Token không hợp lệ" });
    }
};
exports.GetCurrentUser = GetCurrentUser;
