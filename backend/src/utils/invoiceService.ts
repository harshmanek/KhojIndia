import twilio from "twilio";
import { Payment } from "../generated/prisma";
import PDFDocument from 'pdfkit';
import { uploadToS3 } from "./s3Service";

const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
)

export const generateAndSendInvoice = async (payment: Payment & {
    booking: {
        experience: {
            title: string;
            location: string;
            price: string;
        };
        traveller: {
            phone: string;
            firstname: string;
            lastname: string;
        };
    };
}) => {
    try {
        // Generate Pdf invoice
        const doc = new PDFDocument();
        const invoiceBuffer: Buffer[] = [];

        doc.on('data', (chunk) => invoiceBuffer.push(chunk));

        // Add contend to PDF
        doc.fontSize(25).text('KhojIndia Booking Invoice', { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text(`Booking ID: ${payment.bookingId}`);
        doc.text(`Experience: ${payment.booking.experience.title}`);
        doc.text(`Location: ${payment.booking.experience.location}`);
        doc.text(`Amount:₹ ${payment.amount}`);
        doc.text(`Payment ID: ${payment.razorpayPaymentId}`);
        doc.text(`Date: ${payment.paidAt}`);

        doc.end();

        // Upload to DropBox
        const pdfBuffer = Buffer.concat(invoiceBuffer);
        const fileName = `invoices/${payment.bookingId}_${Date.now()}.pdf`;

        const invoiceUrl = await uploadToS3(pdfBuffer,fileName);

        // Send SMS with invoice Link
        await twilioClient.messages.create({
            body: `Thankyou for booking with KhojIndia! Your invoice is ready: ${invoiceUrl}`,
            to: payment.booking.traveller.phone,
            from: process.env.TWILIO_PHONE_NUMBER
        })
        return invoiceUrl;
    } catch (error) {
        console.error("Error generating and sending the invoice:",error);
        throw error;
    }

};