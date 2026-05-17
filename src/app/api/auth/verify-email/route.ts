import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login?error=missing-token", req.url));
  }

  const user = await db.user.findUnique({
    where: { emailVerificationToken: token },
    select: { id: true, emailVerificationTokenExpiry: true, isEmailVerified: true },
  });

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=invalid-token", req.url));
  }

  if (user.isEmailVerified) {
    return NextResponse.redirect(new URL("/login?verified=already", req.url));
  }

  if (!user.emailVerificationTokenExpiry || user.emailVerificationTokenExpiry < new Date()) {
    return NextResponse.redirect(new URL("/login?error=expired-token", req.url));
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpiry: null,
    },
  });

  return NextResponse.redirect(new URL("/login?verified=1", req.url));
}
