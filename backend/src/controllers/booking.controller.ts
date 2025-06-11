import { Request, Response } from "express";
import { PrismaClient, Role, BookingStatus } from "../generated/prisma"
import { connect } from "http2";


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
const prisma = new PrismaClient();

export const createBooking = async (req: Request, res: Response) => {
    try {
        // booking an appointment
        // we need to take the booking details from the request body
        // traveller, travellerId, experience, experienceId,bookingDate, status, payment
        // const user = req.user.id;
        // things i need to do
        // verify whether the user is logged in or not
        // the logged users are only allowed to do the booking
        // the experience id is provided from the frontend
        // based on the experience id the user is allowed to make a payment for it
        // on successful payment the booking is done and booking id is generated
        if (!req.user || req.user.role !== Role.TRAVELLER) {
            return res.status(403).json({ message: `Forbidden only travellers can make bookings` })
        }
        const { experienceId, bookingDate } = req.body;
        const travellerId = req.user.id;

        const experience = await prisma.experience.findUnique({ where: { id: experienceId } });
        if (!experience) return res.status(404).json({ message: "No Experiences with the given id found" });

        const booking = await prisma.booking.create({
            data: {
                traveller: { connect: { id: travellerId } },
                experience: { connect: { id: experienceId } },
                bookingDate: new Date(bookingDate),
                status: BookingStatus.PENDING
            }, include: {
                traveller: true, experience: true
            }
        });
        return res.status(201).json(booking);
    } catch (error) {
        console.error("Error creating booking:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllBookings = async (req: Request, res: Response) => {
    try {
        if (!req.user)
            return res.status(401).json({
                message: "Unauthorized"
            });
        let bookings;
        // admin can view all the bookings
        if (req.user.role === Role.ADMIN) {
            bookings = await prisma.booking.findMany({
                include:
                {
                    traveller: true, experience: true, payment: true
                }
            });
        }
        // hosts can see booking of their experiences
        else if (req.user.role === Role.HOST) {
            bookings = await prisma.booking.findMany({
                where: {
                    experience: {
                        hostId: req.user.id
                    }
                },
                include: { traveller: true, experience: true, payment: true }
            })
        }
        // travllers can see their bookings 
        else if (req.user.role === Role.TRAVELLER) {
            bookings = await prisma.booking.findMany({
                where: {
                    travellerId: req.user.id
                }
                , include: {
                    traveller: true,
                    experience: true,
                    payment: true
                }
            });
        }
        else {
            return res.status(403).json({ message: "Forbidden: Invalid role for this action" })
        }
        return res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching bookings: ", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// get a single booking by booking id
export const getBookingById = async (req: Request, res: Response) => {
    // fetch the bookings by bookingid
    // we need to verify that the user is authorised
    // 
    try {

        const { id } = req.params;
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorises" })
        }
        const booking = await prisma.booking.findUnique({
            where: {
                id
            },
            include: {
                traveller: true,
                experience: true,
                payment: true
            }
        });
        if (!booking) return res.status(404).json({ message: "No booking found with this id" });

        if (req.user.role === Role.TRAVELLER && booking.travellerId !== req.user.id) {
            return res.status(403).json({ message: "Forbidden: You are not the travller for this booking" })
        }
        else if (req.user.role === Role.HOST && booking.experience.hostId === req.user.id) {
            return res.status(403).json({ message: "Unauthorised you are not the host for this experience" });
        }
        //    admin can view all the bookings
        return res.status(200).json(booking);
    } catch (error) {
        console.error("Error fetching booking by ID:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// update booking status (e.g., by host or admin)
export const updateBookingStatus = async (req: Request, res: Response) => {
    // get the id of the booking from the request params
    // get the status of the booking from the request 
    // change the status of the request
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!req.user || (req.user.role !== Role.HOST && req.user.role !== Role.ADMIN)) {
            return res.status(403).json({ message: "Unauthorised" });
        }

        const existingBooking = await prisma.booking.findUnique({
            where: { id },
            include: { experience: true }
        });

        if (!existingBooking) {
            return res.status(404).json({ message: "Booking not found!!" });
        }

        if (req.user.role === Role.HOST && existingBooking.experience.hostId !== req.user.id) {
            return res.status(403).json({ message: "Forbidden: You are not the host of this experience." });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: { status: status as BookingStatus },
            include: { traveller: true, experience: true }
        });
        return res.status(200).json(updatedBooking);
    } catch (error) {
        console.error("Error updating booking system:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteBooking = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorised" });
        }
        const existingBooking = await prisma.booking.findUnique({ where: { id }, include: { experience: true } });

        if (!existingBooking) {
            return res.status(404).json({ message: "No experience found" });
        }
        if (req.user.role === Role.TRAVELLER && existingBooking.travellerId !== req.user.id) {
            return res.status(403).json({ message: "Forbidden: You cannot delete this booking" });
        }
        if (req.user.role === Role.HOST && existingBooking.experience.hostId !== req.user.id) {
            return res.status(403).json({ message: "Forbidden: You cannot delete this booking" });
        }

        if (existingBooking.status === BookingStatus.CONFIRMED && req.user.role !== Role.ADMIN) {
            return res.status(403).json({ message: "Forbidden: Confirmed bookings cannot be deleted by the travellers or hosts." });
        }
        await prisma.booking.delete({ where: { id } });
        return res.status(204).send();
    } catch (error) {
        console.error("Error deleting booking:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}