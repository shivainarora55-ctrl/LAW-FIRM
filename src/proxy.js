import { NextResponse } from "next/server";

export function proxy(request) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin/") && pathname !== "/admin/login" && !request.cookies.has("lf_admin_session")) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};