import { Request, Response } from "express";
import { prisma } from "..";

/**
 * 📌 POST /api/quizzes
 * Body: { lessonId: number, question: string, type: "FILL" | "SINGLE_CHOICE" | "MULTI_CHOICE", options?: string[], answer: string | string[] }
 */
export const createQuiz = async (req: Request, res: Response) => {
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
        if (
            type !== "FILL" &&
            (!Array.isArray(options) || options.length === 0)
        ) {
            return res
                .status(400)
                .json({ message: "Phải có options cho dạng trắc nghiệm" });
        }

        const quiz = await prisma.quiz.create({
            data: {
                lessonId: Number(lessonId),
                question,
                type,
                options: options ? options : undefined,
                answer,
            },
        });

        res.status(201).json({ quiz });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

/**
 * 📌 GET /api/quizzes/:lessonId
 * Lấy danh sách quiz của 1 bài học
 */
export const getQuizzesByLesson = async (req: Request, res: Response) => {
    try {
        const lessonId = Number(req.params.lessonId);

        const quizzes = await prisma.quiz.findMany({
            where: { lessonId },
            orderBy: { id: "asc" },
        });

        res.status(200).json({ quizzes });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

/**
 * 📌 DELETE /api/quizzes/:id
 * Xoá quiz theo id
 */
export const deleteQuiz = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        const quiz = await prisma.quiz.findUnique({ where: { id } });

        if (!quiz) {
            return res.status(404).json({ message: "Không tìm thấy quiz" });
        }

        await prisma.quiz.delete({ where: { id } });

        res.status(200).json({ message: "Đã xoá quiz" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

/**
 * 📌 POST /api/quiz/submit
 * Body: { lessonId: number, answers: [{ quizId: number, answer: string | string[] }] }
 */
export const submitAllAnswers = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { lessonId, answers } = req.body;

        if (!lessonId || !Array.isArray(answers)) {
            return res.status(400).json({ message: "Thiếu dữ liệu" });
        }

        const quizzes = await prisma.quiz.findMany({
            where: { lessonId: Number(lessonId) },
        });

        const results = quizzes.map((quiz) => {
            const submitted = answers.find((a) => a.quizId === quiz.id);

            let correct = false;

            if (submitted) {
                const correctAnswers = Array.isArray(quiz.answer)
                    ? (quiz.answer as string[])
                    : [String(quiz.answer)];

                if (quiz.type === "FILL") {
                    correct =
                        typeof submitted.answer === "string" &&
                        correctAnswers
                            .map((a) => a.toLowerCase().trim())
                            .includes(submitted.answer.toLowerCase().trim());
                } else if (quiz.type === "SINGLE_CHOICE") {
                    correct =
                        typeof submitted.answer === "string" &&
                        submitted.answer === correctAnswers[0];
                } else if (quiz.type === "MULTI_CHOICE") {
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
    } catch (error) {
        console.error("Submit Quiz Error:", error);
        res.status(500).json({ message: "Lỗi server", error });
    }
};
