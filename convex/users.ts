import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const createUser = internalMutation({
    args: {
        clerkId: v.string(),
        email: v.string(),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check if the user already exists to prevent duplicates during webhook retries
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (existingUser) {
            console.log("User already exists, skipping creation.");
            return existingUser._id;
        }

        // Insert the new user
        const newUserId = await ctx.db.insert("users", {
            clerkId: args.clerkId,
            email: args.email,
            firstName: args.firstName,
            lastName: args.lastName,
            role: "customer",
        });

        return newUserId;
    },
});