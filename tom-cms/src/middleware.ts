import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/libs/auth"
import { NextURL } from "next/dist/server/web/next-url";

export default async function middleware(req: NextRequest) {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
        return NextResponse.redirect(new URL("/login", req.nextUrl).toString());
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*" // Match all routes starting with /admin
    ]
}
