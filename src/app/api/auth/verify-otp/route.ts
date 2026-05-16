import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyOtpSchema } from "@/lib/validations/auth";
import { formatPhoneNumber } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = verifyOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    let identifier = validation.data.identifier;
    const { code, type } = validation.data;

    // Normalise phone
    if (identifier.match(/^(\+?234|0)[789]\d{9}$/)) {
      identifier = formatPhoneNumber(identifier);
    }

    const otpRecord = await db.otpCode.findFirst({
      where: {
        identifier,
        type,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "OTP has expired or is invalid. Please request a new one." },
        { status: 400 }
      );
    }

    if (otpRecord.code !== code) {
      return NextResponse.json(
        { error: "Incorrect OTP code. Please check and try again." },
        { status: 400 }
      );
    }

    // Mark OTP as used
    await db.otpCode.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // Update user verification status
    if (type === "PHONE_VERIFY") {
      await db.user.updateMany({
        where: { phone: identifier },
        data: { isPhoneVerified: true },
      });
    } else if (type === "EMAIL_VERIFY") {
      await db.user.updateMany({
        where: { email: identifier },
        data: { isEmailVerified: true },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Verification successful",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
