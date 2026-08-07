import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const jwtSecretStr = process.env.JWT_SECRET;
if (!jwtSecretStr) {
  throw new Error("JWT_SECRET environment variable is required for proxy!");
}
const JWT_SECRET = new TextEncoder().encode(jwtSecretStr);

// Pages that require login
const PROTECTED_PAGES = ["/dashboard", "/settings", "/ai", "/chat", "/search", "/news", "/weather", "/reels", "/quiz", "/emitra", "/documents", "/posts", "/pincode"];

// Pages that require admin
const ADMIN_PAGES = ["/admin"];

// Pages that are always public
const PUBLIC_PAGES = ["/", "/login", "/register", "/privacy-policy", "/terms", "/secret-admin-door", "/maintenance"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes, static files, and public pages
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/posts/") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".json") ||
    pathname.endsWith(".xml") ||
    pathname.endsWith(".txt") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".mp4") ||
    pathname.endsWith(".apk") ||
    pathname.endsWith(".html")
  ) {
    return NextResponse.next();
  }

  // Public pages - always allow
  if (PUBLIC_PAGES.some(p => pathname === p)) {
    return NextResponse.next();
  }

  // Check auth token
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    // No token - redirect to login for protected pages
    if (PROTECTED_PAGES.some(p => pathname.startsWith(p)) || ADMIN_PAGES.some(p => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Admin page check
    if (ADMIN_PAGES.some(p => pathname.startsWith(p))) {
      const adminMobile = process.env.ADMIN_MOBILE?.trim();
      if (payload.role !== "admin" && payload.mobile !== adminMobile) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    return NextResponse.next();
  } catch (e) {
    // Invalid token - clear it and redirect to login
    if (PROTECTED_PAGES.some(p => pathname.startsWith(p)) || ADMIN_PAGES.some(p => pathname.startsWith(p))) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("auth_token");
      return response;
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
