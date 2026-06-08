import { query } from "./_generated/server";

export const getAllStaff = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("salesStaff").collect();
    }
})