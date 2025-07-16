import { Request, Response } from "express";
import { prisma } from "..";
import { AuthenticatedRequest } from "../middleware/Auth";

/**
 * 📌 POST /api/comments
 * Body: { lessonId: number, content: string }
 * Thêm comment vào bài học
 */
export const createComment = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({ message: "Authenticated" });
        }
        const { lessonId, content } = req.body;

        if (!lessonId || !content) {
            return res.status(400).json({ message: "Thiếu dữ liệu" });
        }

        const comment = await prisma.comment.create({
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
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

/**
 * 📌 GET /api/comments/:lessonId
 * Lấy danh sách comment của 1 bài học (kèm user, ngày comment)
 */
export const getCommentsByLesson = async (req: Request, res: Response) => {
    try {
        const lessonId = Number(req.params.lessonId);

        const comments = await prisma.comment.findMany({
            where: { lessonId },
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: { id: true, name: true },
                },
            },
        });

        res.status(200).json({ comments });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

/**
 * 📌 DELETE /api/comments/:id
 * Xoá comment của chính user
 */
export const deleteComment = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({ message: "Authenticated" });
        }
        const id = Number(req.params.id);

        const comment = await prisma.comment.findUnique({
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

        await prisma.comment.delete({ where: { id } });

        res.status(200).json({ message: "Đã xoá comment" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};
