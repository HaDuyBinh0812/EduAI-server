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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFavorites = exports.toggleFavorite = void 0;
const __1 = require("..");
/**
 * 📌 POST /api/favorites
 * Body: { courseId: number }
 * Thêm hoặc xoá yêu thích (toggle)
 */
const toggleFavorite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { courseId } = req.body;
        if (!courseId) {
            return res.status(400).json({ message: "Thiếu courseId" });
        }
        const existing = yield __1.prisma.favorite.findUnique({
            where: {
                userId_courseId: {
                    userId: user.userId,
                    courseId: Number(courseId),
                },
            },
        });
        if (existing) {
            // Đã có thì xoá (bỏ thích)
            yield __1.prisma.favorite.delete({
                where: { id: existing.id },
            });
            return res.status(200).json({ message: "Đã xoá khỏi yêu thích" });
        }
        else {
            // Chưa có thì thêm
            yield __1.prisma.favorite.create({
                data: {
                    userId: user.userId,
                    courseId: Number(courseId),
                },
            });
            return res.status(201).json({ message: "Đã thêm vào yêu thích" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.toggleFavorite = toggleFavorite;
/**
 * 📌 GET /api/favorites
 * Lấy danh sách yêu thích của user
 */
const getFavorites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const favorites = yield __1.prisma.favorite.findMany({
            where: { userId: user.userId },
            include: {
                course: true,
            },
        });
        res.status(200).json({ favorites });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.getFavorites = getFavorites;
