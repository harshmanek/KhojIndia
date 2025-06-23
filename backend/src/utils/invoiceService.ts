import twilio from "twilio";
import { Payment } from "../generated/prisma";
import PDFDocument from 'pdfkit';
import { uploadToS3 } from "./s3Service";
import { resolve } from "path";
import axios from "axios";
import fs from "fs";
import { format, toZonedTime } from "date-fns-tz";



async function shortenUrl(longUrl: string) {
    const response = await axios.get(
        `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`
    );
    return response.data;
}
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
)

export const generateAndSendInvoice = async (payment: Payment & {
    booking: {
        bookingDate: Date;
        status: string;
        experience: {
            title: string;
            location: string;
            price: string;
            description: string;
            date: Date;
        };
        traveller: {
            phone: string;
            firstname: string;
            lastname: string;
            email: string;
        };
    };
}) => {
    try {
        const IST_TIMEZONE = 'Asia/Kolkata';
        const bookingDateIST = format(
            toZonedTime(payment.booking.bookingDate, IST_TIMEZONE),
            'dd/MM/yyyy,hh:mm:ss a zzz',
            { timeZone: IST_TIMEZONE }
        );
        const experienceDateIST = format(
            toZonedTime(payment.booking.experience.date, IST_TIMEZONE),
            'dd/MM/yyyy,hh:mm:ss a zzz',
            { timeZone: IST_TIMEZONE }
        );
        // Generate Pdf invoice
        const doc = new PDFDocument();
        const invoiceBuffer: Buffer[] = [];

        doc.on('data', (chunk) => invoiceBuffer.push(chunk));

        doc.rect(40, 40, 520, 700).stroke(); // this draws a border

        doc.fillColor('#2E86C1').fontSize(28).font('Helvetica-Bold').text('KhojIndia Booking Invoice', { align: "center", underline: true });
        // Add contend to PDF
        doc.moveDown(1);
        doc.fontSize(12)
            .fillColor("black")
            .font('Helvetica')
            .text(`Customer: ${payment.booking.traveller.firstname} ${payment.booking.traveller.lastname}`)
            .text(`Email: ${payment.booking.traveller.email || 'N/A'}`)
            .text(`Phone: ${payment.booking.traveller.phone}`)
            .moveDown(0.5)
            .text(`Booking ID: ${payment.bookingId}`)
            .text(`Booking Date: ${bookingDateIST}`)
            .text(`Booking Status: ${payment.booking.status}`)
            .moveDown(0.5)
            .text(`Payment ID: ${payment.razorpayPaymentId || 'N/A'}`)
            .text(`Payment Method: ${payment.method}`)
            .text(`Payment Status: ${payment.status}`)
            .text(`Payment Date: ${payment.paidAt ? new Date(payment.paidAt).toLocaleString() : 'N/A'}`)
            .moveDown(1);

        doc
            .font('Helvetica-Bold')
            .text('Experience Details:', { underline: true })
            .font('Helvetica')
            .text(`Title: ${payment.booking.experience.title}`)
            .text(`Description: ${payment.booking.experience.description}`)
            .text(`Location: ${payment.booking.experience.location}`)
            .text(`Experience Date: ${experienceDateIST}`)
            .text(`Price: ₹${payment.booking.experience.price}`)
            .moveDown(1);

        doc
            .font('Helvetica-Bold')
            .text('Payment Summary:', { underline: true })
            .font('Helvetica')
            .text(`Amount Paid: ₹${payment.amount}`)
            .moveDown(1);

        doc
            .fontSize(10)
            .fillColor('gray')
            .text('Thank you for booking with KhojIndia!', { align: 'center' })
            .text('For support, contact: support@khojindia.com', { align: 'center' });

        doc.end();
        await new Promise((resolve) => doc.on('end', resolve));


        // Upload to AWS s3
        const pdfBuffer = Buffer.concat(invoiceBuffer);
        const fileName = `invoices/${payment.bookingId}_${Date.now()}.pdf`;
        const s3InvoiceUrl = await uploadToS3(pdfBuffer, fileName);
        const invoiceUrl = await shortenUrl(s3InvoiceUrl);
        console.log(invoiceUrl);
        const smsBody = `Thank you for booking with KhojIndia! Booking ID: ${payment.bookingId}. Invoice: ${invoiceUrl}`;

        // Send SMS with invoice Link
        const message = await twilioClient.messages.create({
            body: smsBody,
            to: payment.booking.traveller.phone,
            from: process.env.TWILIO_PHONE_NUMBER
        })
        console.log(message);
        return invoiceUrl;
    } catch (error) {
        console.error("Error generating and sending the invoice:", error);
        throw error;
    }

};