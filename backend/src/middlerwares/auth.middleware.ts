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
    userRole: string;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {

    try {
        const accessToken = req.cookies.accessToken;
        if(!accessToken)return res.status(401).json({message:"No access token provided"});

        const decoded = verifyAccessToken(accessToken)as any;
        if(!decoded){
            return res.status(401).json({message:"Invalid access token "});
        }
        req.user = {
            id:decoded.userId,
            role:decoded.userRole
        };
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(401).json({ message: "Authentication failed" });
    }
    }
};
