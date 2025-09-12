// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Protect everything except _next/static files and public API routes
    "/((?!_next/static|_next/image|favicon.ico|api/webhook/clerk|api/webhook/stripe|api/uploadthing).*)",
    "/",
  ],
};
