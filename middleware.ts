import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth guard for /panel — currently bypassed.
 * Re-enable by setting ADMIN_AUTH_BYPASS=false and restoring JWT checks.
 */
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*"],
};
