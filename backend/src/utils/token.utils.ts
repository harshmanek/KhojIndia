import jwt from "jsonwebtoken";
import { PrismaClient } from "../generated/prisma";
import { token } from "morgan";


const prisma = new PrismaClient();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';

export const generateTokens = (userId: string, role: string) => {
    const accessToken = jwt.sign({ userId, role }, ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ userId, role }, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
    return { accessToken, refreshToken };
}

export const verifyAccessToken = (token: string) => {
    try {
        return jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch (error) {
        return null;
    }
}

export const verifyRefreshToken = (token: string) => {
    try {
        return jwt.verify(token, REFRESH_TOKEN_SECRET);
    } catch (error) {
        return null;
    }
}

export const setTokens = (res: any, accessToken: string, refreshToken: string) => {
    
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENC === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000 // 1h
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'refreshToken',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7d
    })
}


export const clearTokens = (res: any) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

};1