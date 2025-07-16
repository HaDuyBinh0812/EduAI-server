import { Request, Response } from "express";

import { AuthenticatedRequest } from "../middleware/Auth";
import { prisma } from "..";

//  POST /api/enrollments

export const enrollCourse = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const userId = req.user!.userId;
        const { courseId } = req.body;

        if (!courseId)
            return res.status(400).json({ message: "Thiếu courseId" });

        const existing = await prisma.enrollment.findUnique({
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

        const enrollment = await prisma.enrollment.create({
            data: {
                userId,
                courseId: Number(courseId),
            },
        });

        res.status(201).json({ enrollment });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

// GET /api/enrollments/:courseId

export const checkEnrollment = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const userId = req.user!.userId;
        const courseId = Number(req.params.courseId);

        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
        });

        res.status(200).json({ isEnrolled: !!enrollment });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

//DELETE /api/enrollments/:courseId

export const cancelEnrollment = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const userId = req.user!.userId;
        const courseId = Number(req.params.courseId);

        await prisma.enrollment.delete({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
        });

        res.status(200).json({ message: "Huỷ ghi danh thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};
