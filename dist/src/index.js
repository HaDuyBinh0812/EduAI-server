"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const courseRoute_1 = __importDefault(require("./routes/courseRoute"));
const categoryRoute_1 = __importDefault(require("./routes/categoryRoute"));
const enrollmentRoute_1 = __importDefault(require("./routes/enrollmentRoute"));
const sectionRoute_1 = __importDefault(require("./routes/sectionRoute"));
const lessonRoute_1 = __importDefault(require("./routes/lessonRoute"));
const progressRoute_1 = __importDefault(require("./routes/progressRoute"));
const favoriteRoute_1 = __importDefault(require("./routes/favoriteRoute"));
const commentRoute_1 = __importDefault(require("./routes/commentRoute"));
const quizzRoute_1 = __importDefault(require("./routes/quizzRoute"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_2 = require("./config/cors");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)(cors_2.corsOptions));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
exports.prisma = new client_1.PrismaClient();
// Routes
app.use("/api/auth", authRoute_1.default);
app.use("/api/course", courseRoute_1.default);
app.use("/api/categories", categoryRoute_1.default);
app.use("/api/enrollment", enrollmentRoute_1.default);
app.use("/api/section", sectionRoute_1.default);
app.use("/api/lesson", lessonRoute_1.default);
app.use("/api/progress", progressRoute_1.default);
app.use("/api/favorite", favoriteRoute_1.default);
app.use("/api/comment", commentRoute_1.default);
app.use("/api/quizz", quizzRoute_1.default);
// Health check
app.get("/", (_req, res) => {
    res.send("✅ API is running");
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
