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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCourse = exports.getCourseDetail = exports.getCourses = void 0;
const __1 = require("..");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const promises_1 = __importDefault(require("fs/promises"));
const getCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, categoryId } = req.query;
        const courses = yield __1.prisma.course.findMany({
            where: Object.assign({ title: {
                    contains: search || "",
                    mode: "insensitive",
                } }, (categoryId && { categoryId: Number(categoryId) })),
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
            const allLessons = course.sections.flatMap((section) => section.lessons);
            const totalLessons = allLessons.length;
            const totalDuration = allLessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
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
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.getCourses = getCourses;
//  GET /api/courses/:slug
const getCourseDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const course = yield __1.prisma.course.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.getCourseDetail = getCourseDetail;
//  POST /api/courses
//  multipart/form-data: { title, description, slug, categoryId, thumbnail (file)
const createCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, slug, categoryId } = req.body;
        const file = req.file;
        if (!file)
            return res.status(400).json({ message: "Thiếu ảnh thumbnail" });
        // ✅ Upload ảnh lên Cloudinary
        const upload = yield cloudinary_1.default.uploader.upload(file.path, {
            folder: "courses",
        });
        // ✅ Xoá file local sau khi upload xong
        yield promises_1.default.unlink(file.path);
        const newCourse = yield __1.prisma.course.create({
            data: {
                title,
                description,
                slug,
                thumbnail: upload.secure_url,
                categoryId: Number(categoryId),
            },
        });
        res.status(201).json({ course: newCourse });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi khi tạo khóa học", error });
    }
});
exports.createCourse = createCourse;
