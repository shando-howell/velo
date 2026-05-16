import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const schedule = mutation({
    args: {
        carId: v.id("cars"),
        customerName: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("appointments", {
            carId: args.carId,
            customerName: args.customerName,
            status: "pending"
        })
    }
})

// Retrieve time slots that are already booked for a specific car on a specific day
export const getOccupiedSlots = query({
    args: {
        carId: v.id("cars"),
        dateStr: v.string(), // Format: "YYYY-MM-DD"
    },
    handler: async (ctx, args) => {
        const appointments = await ctx.db
            .query("appointments")
            .withIndex("by_car", (q) => q.eq("carId", args.carId))
            .collect();

            // Filter appointments matching the selected day and return just the times
            return appointments
                .filter((appointment) => (
                    appointment.dateString === args.dateStr && appointment.status !== "cancelled"
                ))
                .map((appointment) => (
                    appointment.timeSlot
                ))
    }
})

// Book the appointment
export const bookAppointment = mutation({
    args: {
        carId: v.id("cars"),
        customerName: v.string(),
        dateString: v.string(), // "YYYY-MM-DD"
        timeSlot: v.string()
    },
    handler: async (ctx, args) => {
        // TODO: Add auth check

        // Double-checking availability to prevent race conditions
        const existing = await ctx.db
            .query("appointments")
            .withIndex("by_car", (q) => q.eq("carId", args.carId))
            .collect();

        const isDoubleBooked = existing.some(
            (appointment) => (
                appointment.dateString === args.dateString 
                    && appointment.timeSlot === args.timeSlot
                    && appointment.status !== "cancelled"
            )
        );

        if (isDoubleBooked) {
            throw new Error("This time slot was just taken. Please choose another.")
        }

        return await ctx.db.insert("appointments", {
            carId: args.carId,
            customerName: args.customerName,
            dateString: args.dateString,
            timeSlot: args.timeSlot,
            status: "pending",
        });
    },
});