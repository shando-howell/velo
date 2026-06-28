import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ClerkProvider } from '@clerk/nextjs'
import ConvexClerkProvider from "@/components/ConvexProviderWithClerk";
import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import "../(public)/globals.css";

export default async function AdminLayout({ children }: { children: ReactNode }) {
    // 1. Grab the current user's session data from Clerk
    const authObj = await auth();

    // 2. Extract the role
    const sessionClaims = authObj.sessionClaims;
    const userRole = sessionClaims?.role;

    // @ts-expect-error: role is undefined
    const { role } = userRole;

    // 3. The definitive security check
    if (role !== "admin") {
        // Unauthorized users are immediately booted to the homepage
        redirect("/")
    }

    // 4. If they pass, render the shared admin shell
    return (
        <html suppressHydrationWarning>
            <body>
                <ClerkProvider>
                    <ConvexClerkProvider>
                        <Navbar/>
                        <div className="min-h-screen flex flex-col">
                            <main className="flex-1">
                                {children}
                            </main>
                        </div>
                    </ConvexClerkProvider>
                </ClerkProvider>
            </body>
        </html>
    );
}