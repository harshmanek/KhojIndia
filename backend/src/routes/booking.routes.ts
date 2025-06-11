import express, { RequestHandler, Router } from "express";
import { createBooking } from "../controllers/booking.controller";
import { authMiddleware } from "../middlerwares/auth.middleware";
import { authorizeRole } from "../middlerwares/role.middleware";
import { Role } from "../generated/prisma";

const bookingRoutes: Router = express.Router();

bookingRoutes.post(
    '/create',
    authMiddleware,
    authorizeRole(Role.TRAVELLER),
    createBooking as unknown as RequestHandler
)
export default bookingRoutes;