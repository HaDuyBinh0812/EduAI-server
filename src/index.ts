import { PrismaClient } from "@prisma/client";

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoute";
import courseRoute from "./routes/courseRoute";
import categoryRoute from "./routes/categoryRoute";
import enrollmentRoute from "./routes/enrollmentRoute";
import sectionRoute from "./routes/sectionRoute";
import lessonRoute from "./routes/lessonRoute";
import progressRoute from "./routes/progressRoute";
import favoriteRoute from "./routes/favoriteRoute";
import commentRoute from "./routes/commentRoute";
import quizzRoute from "./routes/quizzRoute";
import cookieParser from "cookie-parser";
import { corsOptions } from "./config/cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

export const prisma = new PrismaClient();
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/course", courseRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/enrollment", enrollmentRoute);
app.use("/api/section", sectionRoute);
app.use("/api/lesson", lessonRoute);
app.use("/api/progress", progressRoute);
app.use("/api/favorite", favoriteRoute);
app.use("/api/comment", commentRoute);
app.use("/api/quizz", quizzRoute);
// Health check
app.get("/", (_req, res) => {
    res.send("✅ API is running");
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
