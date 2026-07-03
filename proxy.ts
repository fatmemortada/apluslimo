import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const publicRoutes = [
  "/login",
  "/_not-found",
  "/api/auth/login",
  "/api/emails/inboxes",
  "/api/emails",
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
];

// API routes that are public
const publicApiPrefixes = ["/api/auth/"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow public API prefixes
  if (publicApiPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Allow static files
  if (pathname.startsWith("/_next") || pathname.startsWith("/static")) {
    return NextResponse.next();
  }

  // Check for session cookie set by the login flow
  const session = request.cookies.get("chauffeuross_session")?.value;

  // If no session and accessing a protected route, redirect to login
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the original URL as a redirect parameter
    if (pathname !== "/") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
