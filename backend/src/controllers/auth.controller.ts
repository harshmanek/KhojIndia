import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { PrismaClient, Role } from "../generated/prisma";
import { generateToken } from "../utils/jwt";

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
    const { firstname, lastname, email, password, role } = req.body;


    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            firstname,
            lastname,
            email,
            password: hashedPassword,
            role
        }
    });

    const token = generateToken(user.id, user.role);
    res.status(201).json({
        user: {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: user.role
        }, token
    });

};
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: {email} });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Credentials " });

    const token = generateToken(user.id, user.role);
    res.status(201).json({
        user: {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: user.role
        }, token
    });
};