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
exports.getLastViewedLesson = exports.getCourseProgressSummary = exports.getCourseProgress = exports.updateProgress = void 0;
const __1 = require("..");
/**
 * 📌 POST /api/progress
 * Body: { lessonId: number, percentage: number }
 * Ghi nhận tiến độ người dùng trong 1 bài học
 */
const updateProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { lessonId, percentage } = req.body;
        if (!lessonId || percentage === undefined) {
            return res.status(400).json({ message: "Thiếu dữ liệu" });
        }
        const validPercent = Math.min(Math.max(percentage, 0), 1);
        const progress = yield __1.prisma.progress.upsert({
            where: {
                userId_lessonId: {
                    userId: user.userId,
                    lessonId: Number(lessonId),
                },
            },
            update: {
                percentage: validPercent,
                lastViewedAt: new Date(),
            },
            create: {
                userId: user.userId,
                lessonId: Number(lessonId),
                percentage: validPercent,
                lastViewedAt: new Date(),
            },
        });
        res.status(200).json({ progress });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.updateProgress = updateProgress;
/**
 * 📌 GET /api/progress/:courseId
 * Lấy tiến độ của user trong toàn bộ khoá học
 */
const getCourseProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const courseId = Number(req.params.courseId);
        const progresses = yield __1.prisma.progress.findMany({
            where: {
                userId: user.userId,
                lesson: {
                    section: {
                        courseId,
                    },
                },
            },
            include: {
                lesson: {
                    select: {
                        id: true,
                        title: true,
                        sectionId: true,
                    },
                },
            },
        });
        res.status(200).json({ progresses });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.getCourseProgress = getCourseProgress;
/**
 * 📌 GET /api/progress/:courseId/summary
 * Trả về phần trăm hoàn thành khoá học (0 → 100)
 */
const getCourseProgressSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const courseId = Number(req.params.courseId);
        // Đếm tổng số bài học trong khoá học
        const totalLessons = yield __1.prisma.lesson.count({
            where: {
                section: {
                    courseId,
                },
            },
        });
        if (totalLessons === 0) {
            return res.status(200).json({ percentage: 0 });
        }
        // Đếm số bài học user đã có progress > 0.99 (xem hoàn thành)
        const completedLessons = yield __1.prisma.progress.count({
            where: {
                userId: user.userId,
                lesson: {
                    section: {
                        courseId,
                    },
                },
                percentage: {
                    gte: 0.99,
                },
            },
        });
        const percentage = Math.round((completedLessons / totalLessons) * 100);
        res.status(200).json({ percentage, totalLessons });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.getCourseProgressSummary = getCourseProgressSummary;
/**
 * 📌 GET /api/progress/:courseId/last-viewed
 * Trả về bài học user xem gần nhất trong khoá học
 */
const getLastViewedLesson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const courseId = Number(req.params.courseId);
        const lastProgress = yield __1.prisma.progress.findFirst({
            where: {
                userId: user.userId,
                lesson: {
                    section: {
                        courseId,
                    },
                },
            },
            include: {
                lesson: true,
            },
            orderBy: {
                lastViewedAt: "desc",
            },
        });
        if (!lastProgress) {
            return res
                .status(200)
                .json({ message: "Chưa xem bài học nào", lesson: null });
        }
        res.status(200).json({ lesson: lastProgress.lesson });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.getLastViewedLesson = getLastViewedLesson;
