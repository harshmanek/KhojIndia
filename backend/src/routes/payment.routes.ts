import express, { RequestHandler, Router } from "express";
import { createPaymentOrder, getPaymentDetails, verifyPayment } from "../controllers/payment.controller";
import { authMiddleware } from "../middlerwares/auth.middleware";
import { authorizeRole } from "../middlerwares/role.middleware";
import { Role } from "../generated/prisma";

const paymentRoutes: Router = express.Router();
paymentRoutes.post(
    '/create/:bookingId',
    authMiddleware,
    authorizeRole(Role.TRAVELLER),
    createPaymentOrder as RequestHandler
)
paymentRoutes.get(
    '/:paymentId',
    authMiddleware,
    getPaymentDetails as RequestHandler
)
paymentRoutes.post(
    '/verify/:paymentId',
    authMiddleware,
    verifyPayment as RequestHandler
)

export default paymentRoutes;