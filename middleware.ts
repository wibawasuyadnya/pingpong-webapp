import type { NextRequest } from "next/server";
import { sessionAuthMiddleware } from "./middleware/sessionAuthMiddleware";

export async function middleware(req: NextRequest) {
  // Apply Session authentication
  const sessionAuthResponse = await sessionAuthMiddleware(req);
  if (sessionAuthResponse) return sessionAuthResponse;
  return;
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|api|manifest|robots.txt).*)",
  ],
};