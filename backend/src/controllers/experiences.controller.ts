import { Request, Response } from "express";
import { PrismaClient, Role } from "../generated/prisma";

const prisma = new PrismaClient();


// Create a new experience
export const createExperience = async (req: Request, res: Response) => {
    try {
        // check if the user is available and the user is also a Host so that he can only create experiences
        // retrive the id of the user from the request and assign it to the hostId of the experience.
        // using that id the experience will be created
        if (!req.user || req.user.role !== Role.HOST) {
            res.status(403).json({ message: "Forbidden: Only hosts can create experiences" });
            return;
        }

        const { title, description, location, price, imageUrl, date } = req.body;
        const hostId = req.user.id;
        // no need to verify the host because we have already authenticated him in the middleware
        // create the experience with the details obtained from the request
        const experience = await prisma.experience.create({
            data: {
                title,
                description,
                location,
                price,
                imageUrl,
                date: new Date(date),
                host: {
                    connect: {
                        id: hostId
                    }
                }
            }
        });
        res.status(201).json(experience);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// get all experiences
export const getAllExperiences = async (req: Request, res: Response) => {
    // find all the experiences for the users to browse them

    try {
        const experiences = await prisma.experience.findMany({
            include: {
                host: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        email: true
                    }
                }
            }// include host details
        });
        res.status(200).json(experiences);
    } catch (error) {
        console.error("Error fetching all experiences:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// get experiences by id
export const getExperienceById = async (req: Request, res: Response) => {
    // take the id from the request params
    // based on the id find the experience from the database using prisma
    try {
        const { id } = req.params;
        const experience = await prisma.experience.findUnique({
            where: { id },
            include: { host: { select: { id: true, firstname: true, lastname: true, email: true } } }
        });

        if (!experience) {
            res.status(404).json({ message: "Experience not found" });
            return;
        }
        res.status(200).json(experience);
    } catch (error) {
        console.error("Error fetching experience by ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// update the experiences by id
export const updateExperience = async (req: Request, res: Response) => {
    // take the id from the frontend request
    // using that id find a experience
    // comparing the hostId present in the experience and id of the user
    // if the user is the host of the experience then only the user should be allowed to do the update activity
    try {
        const { id } = req.params;
        const { title, description, location, price, imageUrl, date } = req.body;

        if (!req.user || (req.user.role !== Role.HOST && req.user.role !== Role.ADMIN)) {
            res.status(403).json({ message: `Forbidden only hosts and admin can update experiences.` });
            return;
        }
        const existingExperience = await prisma.experience.findUnique({
            where: { id }
        });
        if (!existingExperience) {
            res.status(404).json({ message: "Experience not found" });
            return;
        }
        if (req.user.role === Role.HOST && existingExperience.hostId !== req.user.id) {
            res.status(403).json({
                message: "Forbidden: You are not the host of this experience."
            });
            return;
        }
        const updatedExperience = await prisma.experience.update({
            where: { id },
            data: {
                title,
                description,
                location,
                price,
                imageUrl,
                date: date ? new Date(date) : undefined,
            }
        });
        res.status(200).json(updatedExperience);
    } catch (error) {
        console.error("Error updating experience:", error);
        res.status(500).json({ message: "Internal Server error" });
    }
};

// delete an experience
export const deleteExperience = async (req: Request, res: Response) => {
    // take the id from the request params
    // find a experience based on the id provided in the request
    // the middleware verifies the user for the role having ADMIN or HOST
    // if the user is having role of ADMIN or HOST than only he is allowed to delete an experience
    try {
        const { id } = req.params;

        if (!req.user || (req.user.role !== Role.HOST && req.user.role !== Role.ADMIN)) {
            res.status(403).json({ message: "Forbidden: Only hosts or admins can delete experience" });
            return;
        }
        const existingExperience = await prisma.experience.findUnique({ where: { id } });
        if (!existingExperience) {
            res.status(404).json({ message: "Experience not found " });
            return;
        }
        if (req.user.role === Role.HOST && existingExperience.hostId !== id) {
            res.status(403).json({ message: "Forbidden: You are not the owner of this experience" });
            return;
        }
        await prisma.experience.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting experience:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}