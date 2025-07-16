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
exports.updateSectionOrder = exports.deleteSection = exports.createSection = exports.getSectionsByCourse = void 0;
const __1 = require("..");
/**
 * 📌 GET /api/sections/:courseId
 * Lấy danh sách section theo courseId
 */
const getSectionsByCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courseId = Number(req.params.courseId);
        const sections = yield __1.prisma.section.findMany({
            where: { courseId },
            include: {
                lessons: true,
            },
            orderBy: { order: "asc" },
        });
        res.status(200).json({ sections });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.getSectionsByCourse = getSectionsByCourse;
//   POST /api/sections
//   Body: { title: string, order?: number, courseId: number }
const createSection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, order, courseId } = req.body;
        if (!title || !courseId) {
            return res.status(400).json({ message: "Thiếu thông tin section" });
        }
        const courseID = Number(courseId);
        let newOrder;
        if (order !== undefined) {
            const inputOrder = Number(order);
            // ✅ Đẩy các section >= inputOrder xuống +1
            yield __1.prisma.section.updateMany({
                where: {
                    courseId: courseID,
                    order: { gte: inputOrder },
                },
                data: {
                    order: { increment: 1 },
                },
            });
            newOrder = inputOrder;
        }
        else {
            // ✅ Lấy max order hiện tại rồi +1
            const maxOrderSection = yield __1.prisma.section.aggregate({
                where: { courseId: courseID },
                _max: { order: true },
            });
            newOrder = (maxOrderSection._max.order || 0) + 1;
        }
        const newSection = yield __1.prisma.section.create({
            data: {
                title,
                order: newOrder,
                courseId: courseID,
            },
        });
        res.status(201).json({ section: newSection });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.createSection = createSection;
// DELETE /api/sections/:id
const deleteSection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sectionId = Number(req.params.id);
        // Prisma onDelete cascade là tốt nhất, nếu không:
        yield __1.prisma.lesson.deleteMany({ where: { sectionId } });
        yield __1.prisma.section.delete({
            where: { id: sectionId },
        });
        res.status(200).json({ message: "Xoá section thành công" });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.deleteSection = deleteSection;
// PATCH /api/sections/:id
// Body: { newOrder: number }
const updateSectionOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sectionId = Number(req.params.id);
        const { newOrder } = req.body;
        if (!newOrder)
            return res.status(400).json({ message: "Thiếu newOrder" });
        const section = yield __1.prisma.section.findUnique({
            where: { id: sectionId },
        });
        if (!section)
            return res.status(404).json({ message: "Section không tồn tại" });
        const currentOrder = section.order;
        const courseId = section.courseId;
        if (newOrder === currentOrder) {
            return res
                .status(200)
                .json({ message: "Không có thay đổi thứ tự" });
        }
        if (newOrder > currentOrder) {
            // ✅ Đẩy các section nằm giữa currentOrder <-> newOrder lên trên -1
            yield __1.prisma.section.updateMany({
                where: {
                    courseId,
                    order: { gt: currentOrder, lte: newOrder },
                },
                data: { order: { decrement: 1 } },
            });
        }
        else {
            // ✅ Đẩy các section nằm giữa newOrder <-> currentOrder xuống dưới +1
            yield __1.prisma.section.updateMany({
                where: {
                    courseId,
                    order: { gte: newOrder, lt: currentOrder },
                },
                data: { order: { increment: 1 } },
            });
        }
        // ✅ Cập nhật section này với newOrder
        yield __1.prisma.section.update({
            where: { id: sectionId },
            data: { order: newOrder },
        });
        res.status(200).json({ message: "Cập nhật thứ tự thành công" });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.updateSectionOrder = updateSectionOrder;
