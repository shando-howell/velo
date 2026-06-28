"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import nodemailer from "nodemailer";

export const sendConfirmation = internalAction({
    args: {
        bookingId: v.id("bookings"),
        email: v.string(),
        token: v.string(),
    },
    handler: async (ctx, args) => {
        // Confirmation URL
        const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const confirmationLink = `${domain}/confirm-booking?token=${args.token}`;

        // Gmail SMTP transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_ADDRESS,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        try {
            console.log(`Sending confirmation email to ${args.email} via Gmail...`)

            // Send the email
            await transporter.sendMail({
                from: `"Velo" <${process.env.GMAIL_ADDRESS}>`,
                to: args.email,
                subject: "Confirm your Test Drive",
                html: `
                    <div style="font-family: sans-serif; padding: 20px;">
                        <h2>Test Drive Confirmation</h2>
                        <p>Thank you for scheduling a test drive with us. Please confirm your booking by clicking the link below:</p>
                        <a href="${confirmationLink}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">
                            Confirm Appointment
                        </a>
                    </div>
                `,
            });

            console.log("Email sent successfully.");
        } catch (error) {
            console.error("Failed to send confirmation email:", error);
        }
    },
});