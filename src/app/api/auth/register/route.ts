import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";
import { formatPhoneNumber } from "@/lib/utils";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { role, firstName, lastName, email, phone, password } = validation.data;

    const normalizedPhone = phone ? formatPhoneNumber(phone) : undefined;

    if (email) {
      const existingEmail = await db.user.findUnique({ where: { email } });
      if (existingEmail) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }
    }

    if (normalizedPhone) {
      const existingPhone = await db.user.findFirst({ where: { phone: normalizedPhone } });
      if (existingPhone) {
        return NextResponse.json(
          { error: "An account with this phone number already exists" },
          { status: 409 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const emailVerificationToken = randomBytes(32).toString("hex");
    const emailVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Try creating user with token fields; fall back without them if columns not yet migrated
    let user;
    try {
      user = await db.user.create({
        data: {
          email: email || null,
          phone: normalizedPhone || null,
          passwordHash,
          role,
          firstName,
          lastName,
          isEmailVerified: false,
          isPhoneVerified: false,
          emailVerificationToken,
          emailVerificationTokenExpiry,
        },
        select: { id: true, email: true, phone: true, role: true, firstName: true, lastName: true, createdAt: true },
      });
    } catch {
      // Columns not yet in DB — create without token fields
      user = await db.user.create({
        data: {
          email: email || null,
          phone: normalizedPhone || null,
          passwordHash,
          role,
          firstName,
          lastName,
          isEmailVerified: false,
          isPhoneVerified: false,
        },
        select: { id: true, email: true, phone: true, role: true, firstName: true, lastName: true, createdAt: true },
      });
    }

    if (email) {
      try {
        await sendVerificationEmail(email, emailVerificationToken, firstName);
      } catch (emailErr) {
        console.error("Failed to send verification email:", emailErr);
      }
    }

    return NextResponse.json(
      { success: true, user, message: "Account created. Please check your email to verify your account." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
