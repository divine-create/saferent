import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as {
    email?: string;
    phone?: string;
    newPassword?: string;
    confirmPassword?: string;
  };

  const updateData: Record<string, unknown> = {};

  if (body.email && body.email !== session.user.email) {
    const existing = await db.user.findUnique({ where: { email: body.email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
    updateData.email = body.email;
    updateData.isEmailVerified = false;
  }

  if (body.phone) {
    const existing = await db.user.findFirst({
      where: { phone: body.phone, NOT: { id: session.user.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Phone number already in use" }, { status: 400 });
    }
    updateData.phone = body.phone;
  }

  if (body.newPassword) {
    if (body.newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    if (body.newPassword !== body.confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }
    updateData.passwordHash = await bcrypt.hash(body.newPassword, 12);
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No changes provided" }, { status: 400 });
  }

  const user = await db.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: { id: true, email: true, phone: true },
  });

  return NextResponse.json({ success: true, user });
}
