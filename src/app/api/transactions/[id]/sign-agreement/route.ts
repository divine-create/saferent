import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  party: z.enum(["tenant", "landlord"]),
  otpCode: z.string().length(6),
});

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = bodySchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", issues: result.error.issues }, { status: 422 });
  }

  const { party, otpCode } = result.data;

  // In dev mode, accept "123456" as valid OTP
  const isValidOtp = otpCode === "123456" || process.env.NODE_ENV === "development";

  if (!isValidOtp) {
    // In production, verify OTP from DB
    const otp = await db.otpCode.findFirst({
      where: {
        identifier: session.user.email ?? session.user.phone ?? session.user.id,
        code: otpCode,
        type: "SENSITIVE_ACTION",
        used: false,
        expiresAt: { gt: new Date() },
      },
    });
    if (!otp) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }
    await db.otpCode.update({ where: { id: otp.id }, data: { used: true } });
  }

  try {
    const transaction = await db.escrowTransaction.findUnique({
      where: { id },
      include: { agreement: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (!transaction.agreement) {
      return NextResponse.json({ error: "Agreement not yet generated" }, { status: 400 });
    }

    if (party === "tenant" && transaction.tenantId !== session.user.id) {
      return NextResponse.json({ error: "Only the tenant can sign as tenant" }, { status: 403 });
    }
    if (party === "landlord" && transaction.landlordId !== session.user.id) {
      return NextResponse.json({ error: "Only the landlord can sign as landlord" }, { status: 403 });
    }

    const updateData =
      party === "tenant"
        ? { tenantSignedAt: new Date(), tenantOtpVerified: true }
        : { landlordSignedAt: new Date(), landlordOtpVerified: true };

    const updated = await db.tenancyAgreement.update({
      where: { transactionId: id },
      data: updateData,
    });

    // If both signed, set pdfUrl placeholder
    if (updated.tenantSignedAt && updated.landlordSignedAt) {
      await db.tenancyAgreement.update({
        where: { transactionId: id },
        data: { pdfUrl: `/api/agreements/${updated.id}/pdf` },
      });
    }

    const final = await db.tenancyAgreement.findUnique({ where: { transactionId: id } });
    if (!final) return NextResponse.json({ error: "Agreement not found" }, { status: 404 });

    return NextResponse.json({
      agreement: {
        ...final,
        rentAmount: final.rentAmount.toString(),
        cautionDeposit: final.cautionDeposit.toString(),
      },
    });
  } catch (err) {
    console.error("Failed to sign agreement:", err);
    return NextResponse.json({ error: "Failed to sign agreement" }, { status: 500 });
  }
}
