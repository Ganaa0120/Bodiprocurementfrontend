import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_PATHS: Record<string, string[]> = {
  super_admin: ["/dashboard/admin", "/dashboard/mini-admin"],
  admin:       ["/dashboard/admin", "/dashboard/mini-admin"],  // ← admin хоёуланг харж болно
  individual:  ["/dashboard/person"],
  company:     ["/dashboard/company"],
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/dashboard")) return NextResponse.next();

  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString()
    );
    const role: string = payload.role;
    const allowed = ROLE_PATHS[role] || [];
    const canAccess = allowed.some(p => pathname.startsWith(p));
    if (!canAccess) {
      const home =
        role === "super_admin" || role === "admin" ? "/dashboard/admin"
        : role === "company" ? "/dashboard/company"
        : "/dashboard/person";
      return NextResponse.redirect(new URL(home, req.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};