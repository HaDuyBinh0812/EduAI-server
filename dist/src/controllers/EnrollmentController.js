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
exports.cancelEnrollment = exports.checkEnrollment = exports.enrollCourse = void 0;
const __1 = require("..");
//  POST /api/enrollments
const enrollCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { courseId } = req.body;
        if (!courseId)
            return res.status(400).json({ message: "Thiếu courseId" });
        const existing = yield __1.prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId: Number(courseId),
                },
            },
        });
        if (existing)
            return res
                .status(400)
                .json({ message: "Đã ghi danh khoá học này" });
        const enrollment = yield __1.prisma.enrollment.create({
            data: {
                userId,
                courseId: Number(courseId),
            },
        });
        res.status(201).json({ enrollment });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.enrollCourse = enrollCourse;
// GET /api/enrollments/:courseId
const checkEnrollment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const courseId = Number(req.params.courseId);
        const enrollment = yield __1.prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
        });
        res.status(200).json({ isEnrolled: !!enrollment });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.checkEnrollment = checkEnrollment;
//DELETE /api/enrollments/:courseId
const cancelEnrollment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const courseId = Number(req.params.courseId);
        yield __1.prisma.enrollment.delete({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
        });
        res.status(200).json({ message: "Huỷ ghi danh thành công" });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.cancelEnrollment = cancelEnrollment;
