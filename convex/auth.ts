/* eslint-disable */
import { GenericMutationCtx, GenericQueryCtx } from "convex/server";

export async function isAdmin(ctx: GenericQueryCtx<any> | GenericMutationCtx<any>) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
        return false;
    }

    const publicMetadata = identity.publicMetadata as {role?: string} | undefined;

    return publicMetadata?.role === "admin";
}