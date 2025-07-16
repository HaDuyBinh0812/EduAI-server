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
exports.deleteComment = exports.getCommentsByLesson = exports.createComment = void 0;
const __1 = require("..");
/**
 * 📌 POST /api/comments
 * Body: { lessonId: number, content: string }
 * Thêm comment vào bài học
 */
const createComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({ message: "Authenticated" });
        }
        const { lessonId, content } = req.body;
        if (!lessonId || !content) {
            return res.status(400).json({ message: "Thiếu dữ liệu" });
        }
        const comment = yield __1.prisma.comment.create({
            data: {
                content,
                lessonId: Number(lessonId),
                userId: user.userId,
            },
            include: {
                user: {
                    select: { id: true, name: true },
                },
            },
        });
        res.status(201).json({ comment });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.createComment = createComment;
/**
 * 📌 GET /api/comments/:lessonId
 * Lấy danh sách comment của 1 bài học (kèm user, ngày comment)
 */
const getCommentsByLesson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lessonId = Number(req.params.lessonId);
        const comments = yield __1.prisma.comment.findMany({
            where: { lessonId },
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: { id: true, name: true },
                },
            },
        });
        res.status(200).json({ comments });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.getCommentsByLesson = getCommentsByLesson;
/**
 * 📌 DELETE /api/comments/:id
 * Xoá comment của chính user
 */
const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({ message: "Authenticated" });
        }
        const id = Number(req.params.id);
        const comment = yield __1.prisma.comment.findUnique({
            where: { id },
        });
        if (!comment) {
            return res.status(404).json({ message: "Không tìm thấy comment" });
        }
        if (comment.userId !== user.userId) {
            return res
                .status(403)
                .json({ message: "Không có quyền xoá comment này" });
        }
        yield __1.prisma.comment.delete({ where: { id } });
        res.status(200).json({ message: "Đã xoá comment" });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.deleteComment = deleteComment;
