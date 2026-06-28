import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getBoardBookings = query({
    args: {},
    handler: async (ctx) => {
        // Fetch all bookings
        const bookings = await ctx.db.query("bookings").collect();

        // Map over the bookings to attach the relevant car data and storage URLs
        const bookingsWithDetails = await Promise.all(
            bookings.map(async (booking) => {
                // Fetch the specific car for the booking
                const car = await ctx.db.get(booking.carId);

                // Resolve the internal Convex Storage ID into a readable URL for the frontend
                let carImageUrl = null;
                if (car?.imageId) {
                    carImageUrl = await ctx.storage.getUrl(car.imageId);
                }

                return {
                    ...booking,
                    carDetails: car ? {
                        make: car.make,
                        model: car.model,
                        year: car.year,
                        imageUrl: carImageUrl,
                    } : null,
                };
            })
        );

        return bookingsWithDetails;
    },
});

export const forceVerifyBooking = mutation({
    args: {
        bookingId: v.id("bookings")
    },
    handler: async (ctx, args) => {
        // Look up the booking
        const booking = await ctx.db.get(args.bookingId);

        if (!booking) {
            throw new Error("Booking not found.");
        }

        // Force the status to confirmed
        await ctx.db.patch(args.bookingId, {
            status: "confirmed",
        });

        return { success: true };
    },
});