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
exports.deleteLesson = exports.updateLessonOrder = exports.createLesson = exports.getLessonsBySection = void 0;
const __1 = require("..");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const promises_1 = __importDefault(require("fs/promises"));
/**
 * 📌 GET /api/lessons/:sectionId
 * Lấy danh sách lesson trong section
 */
const getLessonsBySection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sectionId = Number(req.params.sectionId);
        const lessons = yield __1.prisma.lesson.findMany({
            where: { sectionId },
            orderBy: { order: "asc" },
        });
        res.status(200).json({ lessons });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.getLessonsBySection = getLessonsBySection;
/**
 * 📌 POST /api/lessons
 * Body: { title: string, order?: number, sectionId: number }
 * File: video (single file upload)
 */
const createLesson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, order, sectionId } = req.body;
        const file = req.file;
        if (!title || !sectionId || !file) {
            return res
                .status(400)
                .json({ message: "Thiếu thông tin bài học hoặc video" });
        }
        // Upload lên Cloudinary
        const uploadResult = yield cloudinary_1.default.uploader.upload(file.path, {
            resource_type: "video",
            folder: "lessons",
        });
        yield promises_1.default.unlink(file.path);
        let newOrder;
        if (order !== undefined) {
            const inputOrder = Number(order);
            yield __1.prisma.lesson.updateMany({
                where: {
                    sectionId: Number(sectionId),
                    order: { gte: inputOrder },
                },
                data: { order: { increment: 1 } },
            });
            newOrder = inputOrder;
        }
        else {
            const maxOrderLesson = yield __1.prisma.lesson.aggregate({
                where: { sectionId: Number(sectionId) },
                _max: { order: true },
            });
            newOrder = (maxOrderLesson._max.order || 0) + 1;
        }
        const newLesson = yield __1.prisma.lesson.create({
            data: {
                title,
                contentUrl: uploadResult.secure_url,
                order: newOrder,
                sectionId: Number(sectionId),
            },
        });
        res.status(201).json({ lesson: newLesson });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.createLesson = createLesson;
/**
 * 📌 PATCH /api/lessons/:id
 * Đổi thứ tự bài học
 * Body: { newOrder: number }
 */
const updateLessonOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lessonId = Number(req.params.id);
        const { newOrder } = req.body;
        const lesson = yield __1.prisma.lesson.findUnique({
            where: { id: lessonId },
        });
        if (!lesson)
            return res.status(404).json({ message: "Lesson không tồn tại" });
        const sectionId = lesson.sectionId;
        const currentOrder = lesson.order;
        if (newOrder > currentOrder) {
            yield __1.prisma.lesson.updateMany({
                where: {
                    sectionId,
                    order: { gt: currentOrder, lte: newOrder },
                },
                data: { order: { decrement: 1 } },
            });
        }
        else {
            yield __1.prisma.lesson.updateMany({
                where: {
                    sectionId,
                    order: { gte: newOrder, lt: currentOrder },
                },
                data: { order: { increment: 1 } },
            });
        }
        yield __1.prisma.lesson.update({
            where: { id: lessonId },
            data: { order: newOrder },
        });
        res.status(200).json({ message: "Đổi thứ tự thành công" });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.updateLessonOrder = updateLessonOrder;
/**
 * 📌 DELETE /api/lessons/:id
 * Xoá bài học + có thể xoá video trên Cloudinary nếu muốn
 */
const deleteLesson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lessonId = Number(req.params.id);
        const lesson = yield __1.prisma.lesson.findUnique({
            where: { id: lessonId },
        });
        if (!lesson)
            return res.status(404).json({ message: "Lesson không tồn tại" });
        // (Tuỳ chọn) Xoá video trên Cloudinary nếu bạn lưu lại public_id
        // await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
        yield __1.prisma.lesson.delete({ where: { id: lessonId } });
        res.status(200).json({ message: "Xoá bài học thành công" });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.deleteLesson = deleteLesson;
