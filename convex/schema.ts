import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    cars: defineTable({
        make: v.string(),
        model: v.string(),
        year: v.number(),
        price: v.number(),
        status: v.string(),
        imageId: v.optional(v.id("_storage")),
        assignedStaff: v.optional(v.id("salesStaff")),
        
        // --- The OCC Lock Fields ---
        heldBy: v.optional(v.string()),
        leaseExpiresAt: v.optional(v.number())
    })
    .index("by_lease", ["leaseExpiresAt"]),

    salesStaff: defineTable({
        name: v.string(),
        expertise: v.string(),

        // --- The OCC Lock Fields ---
        heldBy: v.optional(v.string()),
        leaseExpiresAt: v.optional(v.number()),
    })
    .index("by_lease", ["leaseExpiresAt"]),

    bookings: defineTable({
        carId: v.id("cars"),
        date: v.string(),
        startTime: v.string(),
        endTime: v.string(),
        status: v.union(
            v.literal("pending"),
            v.literal("confirmed"),
            v.literal("completed")
        ),
        confirmationToken: v.optional(v.string()),

        // Physical Workflow State
        stage: v.optional(v.union(
            v.literal("actionNeeded"),
            v.literal("carPrepped"),
            v.literal("completed"),
            v.literal("noShow")
        )),

        // The strict 10-minute lease timestamp
        expiresAt: v.optional(v.number()),

        // Driver Details
        fullName: v.optional(v.string()),
        email: v.optional(v.string()),
        driversLicense: v.optional(v.string()),
    })
    .index("by_car_and_date", ["carId", "date"])
    .index("by_token", ["confirmationToken"]),

    users: defineTable({
        clerkId: v.string(),
        email: v.string(),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        role: v.optional(v.string())
    }).index("by_clerkId", ["clerkId"]),
});