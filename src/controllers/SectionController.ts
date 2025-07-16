import { Request, Response } from "express";
import { prisma } from "..";

/**
 * 📌 GET /api/sections/:courseId
 * Lấy danh sách section theo courseId
 */
export const getSectionsByCourse = async (req: Request, res: Response) => {
    try {
        const courseId = Number(req.params.courseId);

        const sections = await prisma.section.findMany({
            where: { courseId },
            include: {
                lessons: true,
            },
            orderBy: { order: "asc" },
        });

        res.status(200).json({ sections });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

//   POST /api/sections
//   Body: { title: string, order?: number, courseId: number }

export const createSection = async (req: Request, res: Response) => {
    try {
        const { title, order, courseId } = req.body;
        if (!title || !courseId) {
            return res.status(400).json({ message: "Thiếu thông tin section" });
        }

        const courseID = Number(courseId);

        let newOrder: number;

        if (order !== undefined) {
            const inputOrder = Number(order);

            // ✅ Đẩy các section >= inputOrder xuống +1
            await prisma.section.updateMany({
                where: {
                    courseId: courseID,
                    order: { gte: inputOrder },
                },
                data: {
                    order: { increment: 1 },
                },
            });

            newOrder = inputOrder;
        } else {
            // ✅ Lấy max order hiện tại rồi +1
            const maxOrderSection = await prisma.section.aggregate({
                where: { courseId: courseID },
                _max: { order: true },
            });

            newOrder = (maxOrderSection._max.order || 0) + 1;
        }

        const newSection = await prisma.section.create({
            data: {
                title,
                order: newOrder,
                courseId: courseID,
            },
        });

        res.status(201).json({ section: newSection });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

// DELETE /api/sections/:id

export const deleteSection = async (req: Request, res: Response) => {
    try {
        const sectionId = Number(req.params.id);

        // Prisma onDelete cascade là tốt nhất, nếu không:
        await prisma.lesson.deleteMany({ where: { sectionId } });

        await prisma.section.delete({
            where: { id: sectionId },
        });

        res.status(200).json({ message: "Xoá section thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

// PATCH /api/sections/:id
// Body: { newOrder: number }
export const updateSectionOrder = async (req: Request, res: Response) => {
    try {
        const sectionId = Number(req.params.id);
        const { newOrder } = req.body;

        if (!newOrder)
            return res.status(400).json({ message: "Thiếu newOrder" });

        const section = await prisma.section.findUnique({
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
            await prisma.section.updateMany({
                where: {
                    courseId,
                    order: { gt: currentOrder, lte: newOrder },
                },
                data: { order: { decrement: 1 } },
            });
        } else {
            // ✅ Đẩy các section nằm giữa newOrder <-> currentOrder xuống dưới +1
            await prisma.section.updateMany({
                where: {
                    courseId,
                    order: { gte: newOrder, lt: currentOrder },
                },
                data: { order: { increment: 1 } },
            });
        }

        // ✅ Cập nhật section này với newOrder
        await prisma.section.update({
            where: { id: sectionId },
            data: { order: newOrder },
        });

        res.status(200).json({ message: "Cập nhật thứ tự thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};
