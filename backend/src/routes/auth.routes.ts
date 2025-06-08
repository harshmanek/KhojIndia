import express, { Router } from "express";
import { register, login } from "../controllers/auth.controller";

const authRoutes: Router = express.Router();

authRoutes.post('/register', register as express.RequestHandler);
authRoutes.post('/login', login as express.RequestHandler);

export default authRoutes;