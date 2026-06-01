// import { mutation, query } from "./_generated/server";
// import { v } from "convex/values";

// // export const schedule = mutation({
// //     args: {
// //         carId: v.id("cars"),
// //         customerName: v.string(),
// //         customerEmail: v.string()
// //     },
// //     handler: async (ctx, args) => {
// //         return await ctx.db.insert("appointments", {
// //             carId: args.carId,
// //             customerName: args.customerName,
// //             customerEmail: args.customerEmail,
// //             status: "pending"
// //         })
// //     }
// // })

// // // Retrieve time slots that are already booked for a specific car on a specific day
// // export const getOccupiedSlots = query({
// //     args: {
// //         carId: v.id("cars"),
// //         dateStr: v.string(), // Format: "YYYY-MM-DD"
// //     },
// //     handler: async (ctx, args) => {
// //         const appointments = await ctx.db
// //             .query("appointments")
// //             .withIndex("by_car", (q) => q.eq("carId", args.carId))
// //             .collect();

// //             // Filter appointments matching the selected day and return just the times
// //             return appointments
// //                 .filter((appointment) => (
// //                     appointment.dateString === args.dateStr && appointment.status !== "cancelled"
// //                 ))
// //                 .map((appointment) => (
// //                     appointment.timeSlot
// //                 ))
// //     }
// // })

// // Book the appointment
// export const bookAppointment = mutation({
//     args: {
//         carId: v.id("cars"),
//         customerName: v.string(),
//         customerEmail: v.string(),
//         dateString: v.string(), // "YYYY-MM-DD"
//         timeSlot: v.string()
//     },
//     handler: async (ctx, args) => {
//         // TODO: Add auth check

//         // Double-checking availability to prevent race conditions
//         const existing = await ctx.db
//             .query("appointments")
//             .withIndex("by_car", (q) => q.eq("carId", args.carId))
//             .collect();

//         const isDoubleBooked = existing.some(
//             (appointment) => (
//                 appointment.dateString === args.dateString 
//                     && appointment.timeSlot === args.timeSlot
//                     && appointment.status !== "cancelled"
//             )
//         );

//         if (isDoubleBooked) {
//             throw new Error("This time slot was just taken. Please choose another.")
//         }

//         return await ctx.db.insert("appointments", {
//             carId: args.carId,
//             customerName: args.customerName,
//             customerEmail: args.customerEmail,
//             dateString: args.dateString,
//             timeSlot: args.timeSlot,
//             status: "pending",
//         });
//     },
// });

// // Get all appointments and resolve car information for the admin layout
// export const getAllAppointments = query({
//     handler: async (ctx) => {
//         const appointments = await ctx.db.query("appointments").order("desc").collect();

//         // Map through appointments to append corresponding car information
//         return Promise.all(
//             appointments.map(async (appointment) => {
//                 const car = await ctx.db.get(appointment.carId);

//                 return {
//                     ...appointment,
//                     carDetails: car ? `${car.year} ${car.make} ${car.model}` : "Unknown vehicle."
//                 };
//             })
//         );
//     },
// });

// // Change appointment status (pending to confirmed/cancelled)
// export const updateAppointmentStatus = mutation({
//     args: {
//         id: v.id("appointments"),
//         status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled")),
//     },
//     handler: async (ctx, args) => {
//         await ctx.db.patch(args.id, {status: args.status});
//     },
// });