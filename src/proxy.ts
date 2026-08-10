import { NextRequest, NextResponse } from "next/server";
import { isValidSiteAccessToken, SITE_ACCESS_COOKIE } from "@/lib/site-access";

export function proxy(request: NextRequest) {
  // Keep local development frictionless; enforce the gate on production deployments.
  if (process.env.NODE_ENV !== "production") return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  if (pathname === "/access" || pathname === "/api/site-access") return NextResponse.next();

  const token = request.cookies.get(SITE_ACCESS_COOKIE)?.value;
  if (isValidSiteAccessToken(token)) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Site password required." }, { status: 401 });
  }

  const loginUrl = new URL("/access", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

