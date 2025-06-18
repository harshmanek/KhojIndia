import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { PrismaClient, Role } from "../generated/prisma";
import { clearTokens, generateTokens, setTokens, verifyAccessToken } from "../utils/token.utils";
import jwt from "jsonwebtoken";
const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
    try {
        const { firstname, lastname, email, password, role, phone } = req.body;

        if (!firstname || !lastname || !email || !password || !phone) {
            res.status(400).json({ message: "All fields are required" });
        }

        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        if (!phoneRegex.test(phone)) {
            res.status(400).json({ message: "Invalid phone number format" });
        }
        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                firstname,
                lastname,
                email,
                password: hashedPassword,
                role,
                phone
            }
        });

        const { accessToken, refreshToken } = generateTokens(user.id, user.role);
        setTokens(res, accessToken, refreshToken);

        res.status(201).json({
            user: {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Error in Registering:", error);
        res.status(500).json({ message: "Internal Server error" });
    }

};
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ message: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials " });

        const { accessToken, refreshToken } = generateTokens(user.id, user.role);
        setTokens(res, accessToken, refreshToken);
        res.status(200).json({
            user: {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error("There was a error in logging in:)", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        clearTokens(res);
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout succesfully");
        res.status(500).json({ message: "Internal server error" });
    }
}

export const refresh = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(401).json({ message: "No refresh token provided" });

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as any;
        if (!decoded) {
            return res.status(401).json({ message: "Invalid Refresh token" });
        }

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

        if (!user) {
            return res.status(401).json({ message: "User not fount" });
        }

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.role);
        setTokens(res, accessToken, newRefreshToken);

        res.status(200).json({
            user: {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Token refresh error", error);
        res.status(500).json({ message: "Internal Server error" });
    }
}