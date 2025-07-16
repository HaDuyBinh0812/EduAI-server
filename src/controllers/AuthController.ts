import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "..";
import { SignToken } from "../utils";
import jwt from "jsonwebtoken";
export const Register = async (req: Request, res: Response) => {
    const { email, name, password } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email đã tồn tại" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: "USER",
            },
        });

        const token = SignToken({
            userId: user.id,
            role: user.role,
            email: user.email,
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax", // hoặc "none" nếu FE/BE khác domain
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        })
            .status(201)
            .json({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

export const Login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "Email hoặc mật khẩu sai" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Email hoặc mật khẩu sai" });
        }

        const token = SignToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
            .status(200)
            .json({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

export const Logout = (req: Request, res: Response) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    })
        .status(200)
        .json({ message: "Đăng xuất thành công" });
};

export const GetCurrentUser = (req: Request, res: Response) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: string;
            email: string;
            role: string;
        };

        res.status(200).json({
            user: {
                id: decoded.userId,
                email: decoded.email,
                role: decoded.role,
            },
        });
    } catch (error) {
        res.status(401).json({ message: "Token không hợp lệ" });
    }
};
