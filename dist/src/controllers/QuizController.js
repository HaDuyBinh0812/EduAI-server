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
exports.submitAllAnswers = exports.deleteQuiz = exports.getQuizzesByLesson = exports.createQuiz = void 0;
const __1 = require("..");
/**
 * 📌 POST /api/quizzes
 * Body: { lessonId: number, question: string, type: "FILL" | "SINGLE_CHOICE" | "MULTI_CHOICE", options?: string[], answer: string | string[] }
 */
const createQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { lessonId, question, type, options, answer } = req.body;
        if (!lessonId || !question || !type || answer === undefined) {
            return res.status(400).json({ message: "Thiếu dữ liệu" });
        }
        // Kiểm tra type hợp lệ
        if (!["FILL", "SINGLE_CHOICE", "MULTI_CHOICE"].includes(type)) {
            return res
                .status(400)
                .json({ message: "Loại câu hỏi không hợp lệ" });
        }
        // Validate: nếu là FILL thì không cần options
        if (type !== "FILL" &&
            (!Array.isArray(options) || options.length === 0)) {
            return res
                .status(400)
                .json({ message: "Phải có options cho dạng trắc nghiệm" });
        }
        const quiz = yield __1.prisma.quiz.create({
            data: {
                lessonId: Number(lessonId),
                question,
                type,
                options: options ? options : undefined,
                answer,
            },
        });
        res.status(201).json({ quiz });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.createQuiz = createQuiz;
/**
 * 📌 GET /api/quizzes/:lessonId
 * Lấy danh sách quiz của 1 bài học
 */
const getQuizzesByLesson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lessonId = Number(req.params.lessonId);
        const quizzes = yield __1.prisma.quiz.findMany({
            where: { lessonId },
            orderBy: { id: "asc" },
        });
        res.status(200).json({ quizzes });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.getQuizzesByLesson = getQuizzesByLesson;
/**
 * 📌 DELETE /api/quizzes/:id
 * Xoá quiz theo id
 */
const deleteQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const quiz = yield __1.prisma.quiz.findUnique({ where: { id } });
        if (!quiz) {
            return res.status(404).json({ message: "Không tìm thấy quiz" });
        }
        yield __1.prisma.quiz.delete({ where: { id } });
        res.status(200).json({ message: "Đã xoá quiz" });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.deleteQuiz = deleteQuiz;
/**
 * 📌 POST /api/quiz/submit
 * Body: { lessonId: number, answers: [{ quizId: number, answer: string | string[] }] }
 */
const submitAllAnswers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { lessonId, answers } = req.body;
        if (!lessonId || !Array.isArray(answers)) {
            return res.status(400).json({ message: "Thiếu dữ liệu" });
        }
        const quizzes = yield __1.prisma.quiz.findMany({
            where: { lessonId: Number(lessonId) },
        });
        const results = quizzes.map((quiz) => {
            const submitted = answers.find((a) => a.quizId === quiz.id);
            let correct = false;
            if (submitted) {
                const correctAnswers = Array.isArray(quiz.answer)
                    ? quiz.answer
                    : [String(quiz.answer)];
                if (quiz.type === "FILL") {
                    correct =
                        typeof submitted.answer === "string" &&
                            correctAnswers
                                .map((a) => a.toLowerCase().trim())
                                .includes(submitted.answer.toLowerCase().trim());
                }
                else if (quiz.type === "SINGLE_CHOICE") {
                    correct =
                        typeof submitted.answer === "string" &&
                            submitted.answer === correctAnswers[0];
                }
                else if (quiz.type === "MULTI_CHOICE") {
                    if (Array.isArray(submitted.answer)) {
                        correct =
                            JSON.stringify([...submitted.answer].sort()) ===
                                JSON.stringify([...correctAnswers].sort());
                    }
                }
            }
            return {
                quizId: quiz.id,
                correct,
            };
        });
        const correctCount = results.filter((r) => r.correct).length;
        const total = results.length;
        const score = total > 0 ? (correctCount / total).toFixed(2) : "0.00";
        res.status(200).json({
            results,
            total,
            correct: correctCount,
            score,
        });
    }
    catch (error) {
        console.error("Submit Quiz Error:", error);
        res.status(500).json({ message: "Lỗi server", error });
    }
});
exports.submitAllAnswers = submitAllAnswers;
