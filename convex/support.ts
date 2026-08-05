import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

export const submitTicket = mutation({
    args: {
        department: v.union(v.literal("sales"), v.literal("bespoke"), v.literal("support")),
        clientEmail: v.string(),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        // Insert the new ticket into the database
        const ticketId = await ctx.db.insert("supportTickets", {
            department: args.department,
            clientEmail: args.clientEmail,
            message: args.message,
            status: "open",
        });

        return { success: true, ticketId };
    },
});

// Fetch tickets, ordered by newest first
export const getPaginatedTickets = query({
    args: { paginationOpts: paginationOptsValidator },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("supportTickets")
            .order("desc") // Newest tickets at the top
            .paginate(args.paginationOpts);
    },
});

// Update the status of a specific ticket
export const updateTicketStatus = mutation({
    args: {
        ticketId: v.id("supportTickets"),
        status: v.union(v.literal("open"), v.literal("in-progress"), v.literal("resolved")),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.ticketId, { status: args.status });
        return { success: true };
    },
});