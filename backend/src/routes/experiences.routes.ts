import express, { Router,RequestHandler } from "express";
import { createExperience, deleteExperience, getAllExperiences, getExperienceById, updateExperience } from "../controllers/experiences.controller";
import { authorizeRole } from "../middlerwares/role.middleware";
import { authMiddleware } from "../middlerwares/auth.middleware";
import { Role } from "../generated/prisma";
const experienceRoutes:Router = express.Router();


experienceRoutes.post(
    '/create',
    authMiddleware,
    authorizeRole(Role.HOST), 
    createExperience as unknown as RequestHandler
);

experienceRoutes.get(
    '/getAll',
    getAllExperiences as unknown as RequestHandler
);

experienceRoutes.get(
    '/getById/:id',
    getExperienceById as unknown as RequestHandler
)
experienceRoutes.patch(
    '/update/:id',
    authMiddleware,
    authorizeRole(Role.ADMIN,Role.HOST),
    updateExperience  as unknown as RequestHandler
)
experienceRoutes.delete(
    '/delete/:id',
    authMiddleware,
    authorizeRole(Role.HOST,Role.ADMIN)
    ,deleteExperience as unknown as RequestHandler
)
export default experienceRoutes;