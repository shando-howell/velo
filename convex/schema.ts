import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    cars: defineTable({
        make: v.string(),
        model: v.string(),
        year: v.number(),
        price: v.number(),
        imageId: v.string(),
        
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

    appointments: defineTable({
        carId: v.id("cars"),
        userId: v.string(),
        fullName: v.string(),
        email: v.string(),
        testDriveDate: v.string(),
        driversLicense: v.string(),
        status: v.string(),
    }).index("by_user", ["userId"]),
});