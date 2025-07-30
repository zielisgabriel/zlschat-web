import { NextRequest, NextResponse } from "next/server";
import { PUBLIC_PATHS } from "./environments/PUBLIC_PATHS";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_PRIVATE_KEY);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const jwtToken = request.cookies.get("sessiontoken")?.value;

    if (!PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
        if (!jwtToken) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        try {
            await jwtVerify(jwtToken, SECRET, { algorithms: ["HS256"], issuer: "zlschat" });
            return NextResponse.next();
        } catch {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    if (PUBLIC_PATHS.some(path => pathname.startsWith(path)) && jwtToken) {
        try {
            await jwtVerify(jwtToken, SECRET, { algorithms: ["HS256"] });
            return NextResponse.redirect(new URL("/", request.url));
        } catch (e: any) {
            console.error("Error: ", e);
            return NextResponse.next();
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ]
}