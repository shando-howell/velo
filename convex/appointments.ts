import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const schedule = mutation({
    args: {
        carId: v.id("cars"),
        customerName: v.string(),
        appointmentDate: v.float64()
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("appointments", {
            carId: args.carId,
            customerName: args.customerName,
            appointmentDate: args.appointmentDate,
            status: "pending"
        })
    }
})