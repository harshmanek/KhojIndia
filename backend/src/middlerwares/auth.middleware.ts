import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

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

    // Get token from header
    const authHeader = req.header("Authorization");
    if (!authHeader){
        res.status(401).json({ message: "No Token, authorization denied" });
        return;
    }
    const token = authHeader.split(" ")[1];

    if (!token) {
        res.status(401).json({ message: "No token, authorization denied" });
        return;
    }
    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

        // Attach user to the request object
        req.user = {
            id: decoded.userId,
            role: decoded.userRole,
        };
        next();
    } catch (err) {
        console.error("Token verification Failed: ", err);
        res.status(401).json({ message: "Token is not valid" });
    }
};
