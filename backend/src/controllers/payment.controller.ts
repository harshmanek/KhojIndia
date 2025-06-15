import Razorpay from "razorpay";
import { PrismaClient } from "../generated/prisma";
import { Request, Response } from "express";
import crypto from 'crypto';
import { generateAndSendInvoice } from "../utils/invoiceService";
const prisma = new PrismaClient();
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const createPaymentOrder = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;
        const { amount } = req.body;

        // Verifying the booking exists and is pending
        // fetch the booking using prisma.findUnique 
        // then check the status of the booking
        // booking is present or not
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { experience: true, traveller: true, },
        });
        if (!booking) return res.status(404).json({ message: "NO booking found" });
        // booking is pending or not
        if (booking.status !== "PENDING") {
            return res.status(400).json({ message: "Booking is not in pending state" });
        }

        // Creating Razorpay order
        const options = {
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: `booking_${bookingId}`
        }
        const order = await razorpay.orders.create(options);

        // create payment record
        const payment = await prisma.payment.create({
            data: {
                amount: amount,
                method: 'RAZORPAY',
                bookingId: bookingId,
                razorpayOrderId: order.id,
                status: 'PENDING',
            },
        });
        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            paymentId: payment.id,
        });
    } catch (error) {
        console.error("Error creating payment order:", error);
        res.status(500).json({ error: 'Failed to create payment order' });
    }
};

export const verifyPayment = async (req: Request, res: Response) => {
    try {
        const { paymentId } = req.params;
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;
        // verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ error: "Invalid payment signature" });
        }

        // Update payment record
        const payment = await prisma.payment.update({
            where: { id: paymentId },
            data: {
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                status: 'SUCCESS',
                paidAt: new Date(),
            },
            include: {
                booking: {
                    include: {
                        experience: true,
                        traveller: true,
                    },
                },
            },
        });

        // update booking status
        await prisma.booking.update({
            where: { id: payment.bookingId },
            data: { status: 'CONFIRMED' }
        })

        // send invoice email
        await generateAndSendInvoice(payment);
        res.json({
            success: true,
            message: 'Payment verified successfully',
            payment,
        });
    } catch (error) {
        console.error('error verifying payment:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
};

export const getPaymentDetails = async (req: Request, res: Response) => {
    try {
        const { paymentId } = req.params;

        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                booking: {
                    include: {
                        experience: true,
                        traveller: true,
                    },
                },
            },
        });

        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }
        res.json(payment);
    } catch (error) {
        console.error('Error fetching payment details', error);
        res.status(500).json({ error: 'Failed to fetch payment details' });
    }
};
