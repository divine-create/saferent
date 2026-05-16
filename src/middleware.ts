import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/tenant", "/landlord", "/agent", "/admin", "/onboarding"];
const AUTH_PATHS = ["/login", "/register"];

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuth = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect signed-in users away from auth pages
  if (isAuth && token) {
    const role = (token.role as string) ?? "TENANT";
    const dest = roleToHome(role);
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // If authenticated but hitting root, send to dashboard
  if (pathname === "/" && token) {
    const role = (token.role as string) ?? "TENANT";
    return NextResponse.redirect(new URL(roleToHome(role), req.url));
  }

  return NextResponse.next();
}

function roleToHome(role: string): string {
  if (role === "LANDLORD") return "/landlord";
  if (role === "AGENT") return "/agent";
  if (role === "ADMIN") return "/admin";
  return "/tenant";
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
