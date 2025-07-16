import { Request, Response } from "express";
import { prisma } from "..";
import cloudinary from "../utils/cloudinary";
import fs from "fs/promises";

export const getCourses = async (req: Request, res: Response) => {
    try {
        const { search, categoryId } = req.query;

        const courses = await prisma.course.findMany({
            where: {
                title: {
                    contains: (search as string) || "",
                    mode: "insensitive",
                },
                ...(categoryId && { categoryId: Number(categoryId) }),
            },
            include: {
                category: true,
                sections: {
                    include: {
                        lessons: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const result = courses.map((course) => {
            const allLessons = course.sections.flatMap(
                (section) => section.lessons
            );
            const totalLessons = allLessons.length;
            const totalDuration = allLessons.reduce(
                (sum, lesson) => sum + (lesson.duration || 0),
                0
            );

            return {
                id: course.id,
                title: course.title,
                slug: course.slug,
                description: course.description,
                thumbnail: course.thumbnail,
                createdAt: course.createdAt,
                category: course.category,
                totalLessons,
                totalDuration, // tổng thời lượng tính bằng phút/giây tuỳ theo schema bạn dùng
            };
        });

        res.status(200).json({ courses: result });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

//  GET /api/courses/:slug

export const getCourseDetail = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;

        const course = await prisma.course.findUnique({
            where: { slug },
            include: {
                category: true,
                sections: {
                    include: {
                        lessons: true,
                    },
                },
            },
        });

        if (!course)
            return res.status(404).json({ message: "Không tìm thấy khóa học" });

        res.status(200).json({ course });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

//  POST /api/courses
//  multipart/form-data: { title, description, slug, categoryId, thumbnail (file)

export const createCourse = async (req: Request, res: Response) => {
    try {
        const { title, description, slug, categoryId } = req.body;
        const file = (req as any).file;

        if (!file)
            return res.status(400).json({ message: "Thiếu ảnh thumbnail" });

        // ✅ Upload ảnh lên Cloudinary
        const upload = await cloudinary.uploader.upload(file.path, {
            folder: "courses",
        });

        // ✅ Xoá file local sau khi upload xong
        await fs.unlink(file.path);

        const newCourse = await prisma.course.create({
            data: {
                title,
                description,
                slug,
                thumbnail: upload.secure_url,
                categoryId: Number(categoryId),
            },
        });

        res.status(201).json({ course: newCourse });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi tạo khóa học", error });
    }
};
