import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronOptions } from "@/lib/iron-config/ironOptions";
import { getIronSession, IronSessionData } from "iron-session";

const PUBLIC_ROUTES = ["/login"];
const PUBLIC_ROUTES_FOR_AUTH = ["/login"];
const HOME_PAGE = "/";

export async function sessionAuthMiddleware(
    req: NextRequest
): Promise<NextResponse | void> {
    const pathname = req.nextUrl.pathname;

    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.startsWith("/public") ||
        pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|apng)$/i)
    ) {
        return;
    }

    const response = NextResponse.next();
    const ironOptions = await getIronOptions();
    const session = await getIronSession<IronSessionData>(
        req as any,
        response as any,
        ironOptions
    );

    const isLoggedIn = session?.isLoggedIn;
    const hasAccessToken = session?.user?.access_token;

    if (
        isLoggedIn &&
        hasAccessToken &&
        PUBLIC_ROUTES_FOR_AUTH.some((route) => pathname.startsWith(route))
    ) {
        return NextResponse.redirect(new URL(HOME_PAGE, req.url));
    }

    if (!isLoggedIn || !hasAccessToken) {
        if (!PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
            return NextResponse.redirect(new URL("/login", req.url));
        }
    }

    return;
}
