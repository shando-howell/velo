import { mutation, query } from "./_generated/server";
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

// export const finalizeBooking = mutation({
//     args: {
//         carId: v.id("cars"),
//         userId: v.id("users"),
//         fullName: v.string(),
//         email: v.string(),
//         testDriveDate: v.string(),
//         driversLicense: v.string(),
//     },
//     handler: async (ctx, args) => {
//         const car = await ctx.db.get(args.carId);
//         if (!car) throw new Error("Car was not found in the DB.");

//         const now = Date.now();

//         // Security check: Verify hey actually hold the active lease
//         if (car.heldBy !== args.userId) {
//             throw new Error("Security check failed: You do not own the active hold for this car.");
//         }
//         if (!car.leaseExpiresAt || car.leaseExpiresAt < now) {
//             throw new Error("Your hold has expired. Please try reserving again.")
//         }

//         const bookingId = await ctx.db.insert("bookings", {
//             carId: args.carId,
//             userId: args.userId,
//             fullName: args.fullName,
//             email: args.email,
//             testDriveDate: args.testDriveDate,
//             driversLicense: args.driversLicense,
//             status: "confirmed",
//         });

//         // The Long Hold
//         const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
//         await ctx.db.patch(args.carId, {
//             leaseExpiresAt: now + SEVEN_DAYS,
//         });

//         return { success: true, bookingId };
//     },
// });

// export const getRecentBookings = query({
//     args: {},
//     handler: async (ctx) => {
//         // 1. Fetch the 6 most resent bookings
//         const bookings = await ctx.db
//             .query("bookings")
//             .order("desc")
//             .take(6);

//         const enrichedBookings = await Promise.all(
//             bookings.map(async (booking) => {
//                 const car = await ctx.db.get(booking.carId);
//                 const user = await ctx.db.get(booking.userId);

//                 return {
//                     ...booking,
//                     car: car ? `${car.year} ${car.make} ${car.model}` : "Unknown Vehicle",
//                     customerName: user ? `${user.firstName} ${user.lastName}` : "Unknown Customer",
//                     customerEmail: user?.email || "No email",
//                 };
//             })
//         );

//         return enrichedBookings;
//     },
// });

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
            status: "confirmed",
            fullName: args.fullName,
            email: args.email,
            driversLicense: args.driversLicense,
            expiresAt: undefined, // Clear the lease timer
        });

        return "Success";
    }
})
