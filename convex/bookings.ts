import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const acquireLease = mutation({
    args: {
        carId: v.id("cars"),
        staffId: v.id("salesStaff"),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        // A 10-minute lease duration (10 mins * 60 secs * 1000 ms)
        const LEASE_DURATION = 10 * 60 * 1000;
        const expiresAt = now + LEASE_DURATION;

        // Step 1: The Read Phase
        const car = await ctx.db.get(args.carId);
        const staff = await ctx.db.get(args.staffId);

        if (!car || !staff) {
            throw new Error("Car or Sales Staff member not found.");
        }

        // Step 2: The Guard Phase (OCC Validation)
        // Check if the car is currently help by someone else AND the lease hasn't expired
        const isCarLocked = car.leaseExpiresAt && car.leaseExpiresAt > now && car.heldBy !== args.userId;

        // Check if the selected salesperson is currently locked by another customer
        const isStaffLocked = staff.leaseExpiresAt && staff.leaseExpiresAt > now && staff.heldBy !== args.userId;

        if (isCarLocked) {
            return { 
                success: false,
                reason: "Car is temporarily reserved by another user."
            }
        }

        if (isStaffLocked) {
            return {
                success: false,
                reason: "The selected sales representative is currently in another booking."
            }
        }

        // Step 3: The Commit Phase (Atomic Lock Execution)
        // If both guards pass, we atomically stamp the lease details on both records.
        await ctx.db.patch(args.carId, {
            heldBy: args.userId,
            leaseExpiresAt: expiresAt,
        });

        await ctx.db.patch(args.staffId, {
            heldBy: args.userId,
            leaseExpiresAt: expiresAt
        });

        return {
            success: true,
            leaseExpiresAt: expiresAt,
        };
    },
});