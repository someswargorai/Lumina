import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export default async function proxy(request: NextRequest) {

    const cookie = await cookies();
    const token = cookie.get("next-auth.session-token")?.value || cookie.get("__Secure-next-auth.session-token")?.value;

    //if user is not logged in and tries to access dashboard
    if (!token) {
        if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register") {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL("/login", request.url));
    }

    //if user is logged in and tries to access login or register
    if (token) {
        if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/profile/:path*",
        "/login",
        "/register",
        "/updates/:path*",
        "/search/:path*",
        "/favourites/:path*",
        "/settings/:path*",
        "/trash/:path*",
        "/blogs/:path*",
    ]
}