import express, { Router , RequestHandler} from "express";
import { register, login, refresh, logout } from "../controllers/auth.controller";

const authRoutes: Router = express.Router();

authRoutes.post('/register', register as RequestHandler);
authRoutes.post('/login', login as RequestHandler);
authRoutes.post('/refresh',refresh as RequestHandler);
authRoutes.post('/logout',logout as RequestHandler);

export default authRoutes;