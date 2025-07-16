import { Request, Response } from "express";
import { prisma } from "..";
import cloudinary from "../utils/cloudinary";
import fs from "fs/promises";
/**
 * 📌 GET /api/lessons/:sectionId
 * Lấy danh sách lesson trong section
 */
export const getLessonsBySection = async (req: Request, res: Response) => {
    try {
        const sectionId = Number(req.params.sectionId);

        const lessons = await prisma.lesson.findMany({
            where: { sectionId },
            orderBy: { order: "asc" },
        });

        res.status(200).json({ lessons });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

/**
 * 📌 POST /api/lessons
 * Body: { title: string, order?: number, sectionId: number }
 * File: video (single file upload)
 */
export const createLesson = async (req: Request, res: Response) => {
    try {
        const { title, order, sectionId } = req.body;
        const file = req.file;

        if (!title || !sectionId || !file) {
            return res
                .status(400)
                .json({ message: "Thiếu thông tin bài học hoặc video" });
        }

        // Upload lên Cloudinary
        const uploadResult = await cloudinary.uploader.upload(file.path, {
            resource_type: "video",
            folder: "lessons",
        });

        await fs.unlink(file.path);

        let newOrder: number;

        if (order !== undefined) {
            const inputOrder = Number(order);
            await prisma.lesson.updateMany({
                where: {
                    sectionId: Number(sectionId),
                    order: { gte: inputOrder },
                },
                data: { order: { increment: 1 } },
            });
            newOrder = inputOrder;
        } else {
            const maxOrderLesson = await prisma.lesson.aggregate({
                where: { sectionId: Number(sectionId) },
                _max: { order: true },
            });
            newOrder = (maxOrderLesson._max.order || 0) + 1;
        }

        const newLesson = await prisma.lesson.create({
            data: {
                title,
                contentUrl: uploadResult.secure_url,
                order: newOrder,
                sectionId: Number(sectionId),
            },
        });

        res.status(201).json({ lesson: newLesson });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

/**
 * 📌 PATCH /api/lessons/:id
 * Đổi thứ tự bài học
 * Body: { newOrder: number }
 */
export const updateLessonOrder = async (req: Request, res: Response) => {
    try {
        const lessonId = Number(req.params.id);
        const { newOrder } = req.body;

        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
        });
        if (!lesson)
            return res.status(404).json({ message: "Lesson không tồn tại" });

        const sectionId = lesson.sectionId;
        const currentOrder = lesson.order;

        if (newOrder > currentOrder) {
            await prisma.lesson.updateMany({
                where: {
                    sectionId,
                    order: { gt: currentOrder, lte: newOrder },
                },
                data: { order: { decrement: 1 } },
            });
        } else {
            await prisma.lesson.updateMany({
                where: {
                    sectionId,
                    order: { gte: newOrder, lt: currentOrder },
                },
                data: { order: { increment: 1 } },
            });
        }

        await prisma.lesson.update({
            where: { id: lessonId },
            data: { order: newOrder },
        });

        res.status(200).json({ message: "Đổi thứ tự thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

/**
 * 📌 DELETE /api/lessons/:id
 * Xoá bài học + có thể xoá video trên Cloudinary nếu muốn
 */
export const deleteLesson = async (req: Request, res: Response) => {
    try {
        const lessonId = Number(req.params.id);

        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
        });
        if (!lesson)
            return res.status(404).json({ message: "Lesson không tồn tại" });

        // (Tuỳ chọn) Xoá video trên Cloudinary nếu bạn lưu lại public_id
        // await cloudinary.uploader.destroy(publicId, { resource_type: "video" });

        await prisma.lesson.delete({ where: { id: lessonId } });

        res.status(200).json({ message: "Xoá bài học thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};
