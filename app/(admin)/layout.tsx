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
                        <div className="min-h-screen bg-gray-50 flex flex-col">
                            <header className="bg-slate-900 text-white p-4 shadow-md">
                                <h1 className="text-xl text-yellow-600 font-bold tracking-tight">
                                    Velo Admin Panel
                                </h1>
                                <main className="flex-1 p-8">
                                    {children}
                                </main>
                            </header>
                        </div>
                    </ConvexClerkProvider>
                </ClerkProvider>
            </body>
        </html>
    );
}