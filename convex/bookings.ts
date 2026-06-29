import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Calculate available slots dynamically
export const getAvailableSlots = query({
    args: { 
        carId: v.id("cars"), 
        date: v.string()
    },
    handler: async (ctx, args) => {
        const existingBookings = await ctx.db
            .query("bookings")
            .withIndex("by_car_and_date", (q) => (
                q.eq("carId", args.carId).eq("date", args.date)
            ))
            .filter((q) => q.neq(q.field("status"), "completed"))
            .collect();

        // Dealership Hours: 9:00 AM to 5:00 PM (60-minute slots)
        const businessStart = 9 * 60;
        const businessEnd = 17 * 60;
        const slotDuration = 60;

        const availableSlots = [];

        for (let time = businessStart; time <= businessEnd - slotDuration; time += slotDuration) {
            const slotStart = time;
            const slotEnd = time + slotDuration;

            const isConflict = existingBookings.some((booking) => {
                // Only count conflicts if the booking is confirmed OR the pending lock hasn't expired
                const isLocked = booking.status === "pending" && booking.expiresAt && Date.now() < booking.expiresAt;
                const isConfirmed = booking.status === "confirmed";

                if (!isLocked && !isConfirmed)  return false; // Ignore expired locks

                const [bStartHour, bStartMin] = booking.startTime.split(":").map(Number);
                const [bEndHour, bEndMin] = booking.endTime.split(":").map(Number);
                const bStart = bStartHour * 60 + bStartMin;
                const bEnd = bEndHour * 60 + bEndMin;

                return slotStart < bEnd && slotEnd > bStart;
            });

            if (!isConflict) {
                const formatTime = (mins: number) => 
                    `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
                    availableSlots.push(formatTime(slotStart));
                
            }
        }

        return availableSlots;
    },
});

// Initiate the temporary lease
export const lockTimeSlot = mutation({
    args: {
        carId: v.id("cars"),
        date: v.string(),
        startTime: v.string(),
        endTime: v.string(),
    },
    handler: async (ctx, args) => {
        const tenMinutesFromNow = Date.now() + 10 * 60 * 1000;

        const bookingId = await ctx.db.insert("bookings", {
            carId: args.carId,
            date: args.date,
            startTime: args.startTime,
            endTime: args.endTime,
            status: "pending",
            expiresAt: tenMinutesFromNow,
        });

        return { bookingId, expiresAt: tenMinutesFromNow }
    },
});

// Step 2: Finalize the booking
export const confirmBooking = mutation({
    args: {
        bookingId: v.id("bookings"),
        fullName: v.string(),
        email: v.string(),
        driversLicense: v.string(),
    },
    handler: async (ctx, args) => {
        const booking = await ctx.db.get(args.bookingId);

        // Generate a unique token for the email link
        const token = crypto.randomUUID();

        if (!booking) {
            throw new Error("Booking not found.");
        }

        if (booking.status !== "pending") {
            throw new Error("Booking is no longer pending.")
        }

        // Server-side validation for the lease
        if (booking.expiresAt && Date.now() > booking.expiresAt) {
            // Clean up the expired lock so other can book it
            await ctx.db.delete(args.bookingId);
            throw new Error("Your 10-minute reservation has expired.");
        }

        await ctx.db.patch(args.bookingId, {
            fullName: args.fullName,
            email: args.email,
            driversLicense: args.driversLicense,
            expiresAt: undefined, // Clear the lease timer
            confirmationToken: token,
        });

        // Schedule the background action to send the email
        await ctx.scheduler.runAfter(0, internal.emails.sendConfirmation, {
            bookingId: args.bookingId,
            email: args.email,
            token: token,
        });

        return "Success";
    }
});

export const verifyBooking = mutation({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        // Find the booking by its token
        const booking = await ctx.db
            .query("bookings")
            .withIndex("by_token", (q) => q.eq("confirmationToken", args.token))
            .first();

        if (!booking) {
            throw new Error("Invalid or expired confirmation token");
        }

        if (booking.status === "confirmed") {
            return { success: true, message: "Booking is already confirmed." };
        }

        // Update the status
        await ctx.db.patch(booking._id, {
            status: "confirmed",
            stage: "actionNeeded"
        });

        return { success: true, message: "Booking confirmed successfully!" };
    },
});

export const updateBookingStage = mutation({
    args: {
        bookingId: v.id("bookings"),
        newStage: v.union(
            v.literal("actionNeeded"),
            v.literal("carPrepped"),
            v.literal("completed"),
            v.literal("noShow")
        ),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.bookingId, {
            stage: args.newStage,
        });

        return { success: true }
    }
});
