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
// prisma/seed.ts
// đường dẫn đến Prisma Client
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Xoá toàn bộ dữ liệu cũ nếu cần (không bắt buộc)
        yield prisma.user.deleteMany();
        // Hash password
        const adminPassword = yield bcryptjs_1.default.hash("admin123", 10);
        const userPassword = yield bcryptjs_1.default.hash("user123", 10);
        // Tạo admin
        yield prisma.user.create({
            data: {
                email: "admin@example.com",
                name: "Admin",
                password: adminPassword,
                role: "ADMIN",
            },
        });
        // Tạo user thường
        yield prisma.user.create({
            data: {
                email: "user@example.com",
                name: "User",
                password: userPassword,
                role: "USER",
            },
        });
        console.log("✅ Seeded users successfully.");
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1); // thoát nếu có lỗi
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
