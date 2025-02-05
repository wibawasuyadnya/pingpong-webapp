// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth check for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/public") ||
    pathname.includes(".webp") ||
    pathname.includes(".jpg")
  ) {
    return;
  }

  // Get the cookie value properly
  const authCookie = request.cookies.get("isAuthenticated")?.value;
  const isAuthenticated = authCookie === "true";

  // Define protected routes
  const protectedRoutes = ["/"];

  // Define public routes
  const publicRoutes = ["/login"];

  // Check if the current route is a public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect to login if unauthenticated and trying to access protected routes
  if (
    !isAuthenticated &&
    !isPublicRoute &&
    protectedRoutes.some((route) => pathname.startsWith(route))
  ) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to home if authenticated and trying to access login or register
  if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|manifest|robots.txt).*)"],
};
