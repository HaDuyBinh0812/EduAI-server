import { Request, Response } from "express";
import { prisma } from "..";

// GET /api/categories

export const GetCategories = async (req: Request, res: Response) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                courses: true,
            },
            orderBy: {
                id: "asc",
            },
        });

        res.status(200).json({ categories });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

// POST /api/categories
export const CreateCategory = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;

        if (!name)
            return res
                .status(400)
                .json({ message: "Tên danh mục là bắt buộc" });

        const existing = await prisma.category.findUnique({ where: { name } });
        if (existing)
            return res.status(400).json({ message: "Danh mục đã tồn tại" });

        const newCategory = await prisma.category.create({
            data: { name },
        });

        res.status(201).json({ category: newCategory });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};
