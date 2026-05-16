import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateOtp, formatPhoneNumber } from "@/lib/utils";
import { z } from "zod";

const sendOtpSchema = z.object({
  identifier: z.string().min(1, "Identifier is required"),
  type: z.enum(["PHONE_VERIFY", "EMAIL_VERIFY", "LOGIN", "SENSITIVE_ACTION"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = sendOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { type } = validation.data;
    let identifier = validation.data.identifier;

    // Normalise phone numbers
    if (identifier.match(/^(\+?234|0)[789]\d{9}$/)) {
      identifier = formatPhoneNumber(identifier);
    }

    // Invalidate any existing unused OTPs
    await db.otpCode.updateMany({
      where: {
        identifier,
        type,
        used: false,
      },
      data: { used: true },
    });

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.otpCode.create({
      data: {
        identifier,
        code,
        type,
        expiresAt,
      },
    });

    // In production, send via SMS/email provider
    // For now, return the code in development
    console.log(`[OTP] Code for ${identifier}: ${code}`);

    return NextResponse.json({
      success: true,
      message: `OTP sent to ${identifier}`,
      // Only return code in dev mode
      ...(process.env.NODE_ENV !== "production" && { code }),
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
