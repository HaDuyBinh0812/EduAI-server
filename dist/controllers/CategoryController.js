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
exports.CreateCategory = exports.GetCategories = void 0;
const __1 = require("..");
// GET /api/categories
const GetCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield __1.prisma.category.findMany({
            include: {
                courses: true,
            },
            orderBy: {
                id: "asc",
            },
        });
        res.status(200).json({ categories });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.GetCategories = GetCategories;
// POST /api/categories
const CreateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        if (!name)
            return res
                .status(400)
                .json({ message: "Tên danh mục là bắt buộc" });
        const existing = yield __1.prisma.category.findUnique({ where: { name } });
        if (existing)
            return res.status(400).json({ message: "Danh mục đã tồn tại" });
        const newCategory = yield __1.prisma.category.create({
            data: { name },
        });
        res.status(201).json({ category: newCategory });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.CreateCategory = CreateCategory;
