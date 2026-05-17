import { clerkMiddleware, createRouteMatcher  } from '@clerk/nextjs/server';
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const authObj = await auth();

  // If trying to access admin route
  if (isAdminRoute(req)) {
    // Force log in if unauthenticated
    if (!authObj.userId) {
      return (await auth()).redirectToSignIn({ returnBackUrl: req.url});
    }

    // Check metatdata role property, redirect home if not an admin
    const sessionClaims = authObj.sessionClaims;
    const sessionsRole  = sessionClaims?.role
    const { role } = sessionsRole;

    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};