import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

http.route({
    path: "/clerk",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        // 1. Get the raw body and headers
        const payloadString = await request.text();
        const headerPayload = request.headers;

        // 2. Extract the specific Svix headers Clerk sends
        const svixHeaders = {
            "svix-id": headerPayload.get("svix-id")!,
            "svix-timestamp": headerPayload.get("svix-timestamp")!,
            "svix-signature": headerPayload.get("svix-signature")!,
        };

        // 3. Initialize Svix
        const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
        // eslint-disable-next-line
        let evt: any;

        // 4. Verify the cryptographic signature
        try {
            evt = wh.verify(payloadString, svixHeaders);
        } catch (err) {
            console.error("Error verifying webhook:", err);
            return new Response("Invalid signature", {status: 400});
        }

        // 5. Process the event payload
        const eventType = evt.type;

        if (eventType === "user.created") {
            const { id, email_addresses, first_name, last_name } = evt.data;
            const primaryEmail = email_addresses[0]?.email_address;

            console.log(`New user created in Clerk: ${id}`);

            await ctx.runMutation(internal.users.createUser, {
                clerkId: id,
                email: primaryEmail,
                firstName: first_name,
                lastName: last_name,
            });
        }

        return new Response("Webhook processed successfully", { status:  200 });
    }),
});

export default http;