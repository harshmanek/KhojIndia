import express, { NextFunction, Request, Response, RequestHandler, Router } from "express";
import { createBooking, deleteBooking, getAllBookings, getBookingById, updateBookingStatus } from "../controllers/booking.controller";
import { authMiddleware } from "../middlerwares/auth.middleware";
import { authorizeRole } from "../middlerwares/role.middleware";
import { Role } from "../generated/prisma";

const bookingRoutes: Router = express.Router();



bookingRoutes.post(
    '/create',
    authMiddleware,
    authorizeRole(Role.TRAVELLER),
    createBooking as RequestHandler
);

bookingRoutes.get(
    '/',
    authMiddleware,
    getAllBookings as RequestHandler
);

bookingRoutes.get(
    '/:id',
    authMiddleware,
    getBookingById as RequestHandler
);

bookingRoutes.patch(
    '/:id/status',
    authMiddleware,
    authorizeRole(Role.HOST, Role.ADMIN),
    updateBookingStatus as RequestHandler
);

bookingRoutes.delete(
    '/:id',
    authMiddleware,
    deleteBooking as RequestHandler
);

export default bookingRoutes;