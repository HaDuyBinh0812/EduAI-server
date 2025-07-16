import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

interface TokenPayload {
    userId: number;
    email: string;
    role: "ADMIN" | "USER";
}

export const SignToken = (payload: TokenPayload, expiresIn = "7d"): string => {
    return jwt.sign(payload, JWT_SECRET as string, {
        expiresIn: expiresIn as any, // 👈 fix TypeScript type conflict
    });
};

export const VerifyToken = (token: string): TokenPayload => {
    return jwt.verify(token, JWT_SECRET as string) as TokenPayload;
};
