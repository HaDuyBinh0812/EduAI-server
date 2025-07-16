import { Request, Response } from "express";
import { prisma } from "..";

/**
 * 📌 POST /api/favorites
 * Body: { courseId: number }
 * Thêm hoặc xoá yêu thích (toggle)
 */
export const toggleFavorite = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({ message: "Thiếu courseId" });
        }

        const existing = await prisma.favorite.findUnique({
            where: {
                userId_courseId: {
                    userId: user.userId,
                    courseId: Number(courseId),
                },
            },
        });

        if (existing) {
            // Đã có thì xoá (bỏ thích)
            await prisma.favorite.delete({
                where: { id: existing.id },
            });
            return res.status(200).json({ message: "Đã xoá khỏi yêu thích" });
        } else {
            // Chưa có thì thêm
            await prisma.favorite.create({
                data: {
                    userId: user.userId,
                    courseId: Number(courseId),
                },
            });
            return res.status(201).json({ message: "Đã thêm vào yêu thích" });
        }
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

/**
 * 📌 GET /api/favorites
 * Lấy danh sách yêu thích của user
 */
export const getFavorites = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;

        const favorites = await prisma.favorite.findMany({
            where: { userId: user.userId },
            include: {
                course: true,
            },
        });

        res.status(200).json({ favorites });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};
