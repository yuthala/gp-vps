import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /dashboard and its subpaths
  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "dev-secret" });
    if (!token) {
      // fall back to our persistent session check
      try {
        const origin = req.nextUrl.origin;
        const validateRes = await fetch(`${origin}/api/session/validate`, { headers: { cookie: req.headers.get('cookie') || '' } });
        if (!validateRes.ok) {
          const loginUrl = new URL("/login-page", req.url);
          return NextResponse.redirect(loginUrl);
        }
        // valid session — allow
      } catch (e) {
        console.log(e)
        const loginUrl = new URL("/login-page", req.url);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};