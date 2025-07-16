// prisma/seed.ts
// đường dẫn đến Prisma Client
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    // Xoá toàn bộ dữ liệu cũ nếu cần (không bắt buộc)
    await prisma.user.deleteMany();

    // Hash password
    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);

    // Tạo admin
    await prisma.user.create({
        data: {
            email: "admin@example.com",
            name: "Admin",
            password: adminPassword,
            role: "ADMIN",
        },
    });

    // Tạo user thường
    await prisma.user.create({
        data: {
            email: "user@example.com",
            name: "User",
            password: userPassword,
            role: "USER",
        },
    });

    console.log("✅ Seeded users successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1); // thoát nếu có lỗi
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
