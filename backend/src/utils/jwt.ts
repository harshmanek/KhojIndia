import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || 'ramblu_secret';

export const generateToken = (userId: string, role: string):string => {     
    // ensure jwt secret is defined in my .env
    if(!process.env.JWT_SECRET){
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export const verifyToken = (token: string) => {
    return jwt.verify(token, JWT_SECRET);
}