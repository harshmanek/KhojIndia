import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { verifyAccessToken } from "../utils/token.utils";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: string;
            };
        }
    }
}

interface DecodedToken {
    userId: string;
    role: string;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {

    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) { res.status(401).json({ message: "No access token provided" }); return; }

        const decoded = verifyAccessToken(accessToken) as any;
        if (!decoded) {
            res.status(401).json({ message: "Invalid access token " });
            return;
        }
        // console.log(" decoded userid: ", decoded.userId, " decoded role: ", decoded.role);
        req.user = {
            id: decoded.userId,
            role: decoded.role
        };
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(401).json({ message: "Authentication failed" });
    }
}

