import { Request, Response, NextFunction } from "express";
import { Role } from "../generated/prisma"//importing role enum

export const authorizeRole = (...allowedRoles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.role) {
            res.status(401).json({ message: "Unauthorised: User role not found" });
            return;
        }
        if (!allowedRoles.includes(req.user.role as Role)) {
            res.status(401).json({ message: `Forbidden: only ${allowedRoles.join(",")} are allowed to perform this action.` });
            return;
        }
        next();
    };
}