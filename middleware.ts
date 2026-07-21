import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Auth guard for /panel — requires a valid NextAuth JWT unless bypass is on.
 */
export async function middleware(req: NextRequest) {
  if (process.env.ADMIN_AUTH_BYPASS === "true") {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;

  // Always allow the login page and NextAuth callback routes.
  if (pathname === "/panel/login" || pathname.startsWith("/panel/login/")) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.userId) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/panel/login";
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*"],
};
