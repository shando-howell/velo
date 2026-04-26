import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    cars: defineTable({
        make: v.string(),
        model: v.string(),
        year: v.number(),
        price: v.number(),
        imageId: v.string(),
        isAvailable: v.boolean()
    }),
    appointments: defineTable({
        carId: v.id("cars"),
        customerName: v.string(),
        appointmentDate: v.float64(),
        status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled"))
    }).index("by_car", ["carId"]),
});