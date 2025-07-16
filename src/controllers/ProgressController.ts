import { Request, Response } from "express";
import { prisma } from "..";

/**
 * 📌 POST /api/progress
 * Body: { lessonId: number, percentage: number }
 * Ghi nhận tiến độ người dùng trong 1 bài học
 */
export const updateProgress = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { lessonId, percentage } = req.body;

        if (!lessonId || percentage === undefined) {
            return res.status(400).json({ message: "Thiếu dữ liệu" });
        }

        const validPercent = Math.min(Math.max(percentage, 0), 1);

        const progress = await prisma.progress.upsert({
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
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

/**
 * 📌 GET /api/progress/:courseId
 * Lấy tiến độ của user trong toàn bộ khoá học
 */
export const getCourseProgress = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const courseId = Number(req.params.courseId);

        const progresses = await prisma.progress.findMany({
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
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

/**
 * 📌 GET /api/progress/:courseId/summary
 * Trả về phần trăm hoàn thành khoá học (0 → 100)
 */
export const getCourseProgressSummary = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const courseId = Number(req.params.courseId);

        // Đếm tổng số bài học trong khoá học
        const totalLessons = await prisma.lesson.count({
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
        const completedLessons = await prisma.progress.count({
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
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

/**
 * 📌 GET /api/progress/:courseId/last-viewed
 * Trả về bài học user xem gần nhất trong khoá học
 */
export const getLastViewedLesson = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const courseId = Number(req.params.courseId);

        const lastProgress = await prisma.progress.findFirst({
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
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};
