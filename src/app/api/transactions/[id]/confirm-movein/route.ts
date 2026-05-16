import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { generateTransactionRef } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  photoUrl: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "TENANT") {
    return NextResponse.json({ error: "Only tenants can confirm move-in" }, { status: 403 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const result = bodySchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", issues: result.error.issues }, { status: 422 });
  }

  const { latitude, longitude, photoUrl } = result.data;

  try {
    const transaction = await db.escrowTransaction.findUnique({
      where: { id },
      include: { moveInRecord: true, dispute: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (transaction.tenantId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (transaction.escrowStatus !== "FUNDED") {
      return NextResponse.json(
        { error: "Transaction must be FUNDED before confirming move-in" },
        { status: 400 }
      );
    }

    if (transaction.dispute) {
      return NextResponse.json({ error: "Cannot confirm move-in — dispute is open" }, { status: 400 });
    }

    // Validate timing: must be on or after moveInDate (within 72h window already validated by autoReleaseAt)
    const now = new Date();
    const moveIn = new Date(transaction.moveInDate);
    const earliest = new Date(moveIn);
    earliest.setDate(earliest.getDate() - 1); // allow 1 day early

    if (now < earliest) {
      return NextResponse.json(
        { error: "Too early to confirm move-in" },
        { status: 400 }
      );
    }

    // Update move-in record
    await db.moveInRecord.update({
      where: { transactionId: id },
      data: {
        status: "CONFIRMED",
        confirmedAt: now,
        tenantLatitude: latitude,
        tenantLongitude: longitude,
        photoUrl,
      },
    });

    // Simulate payout: release escrow
    const payoutSentAt = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2h
    const payoutReference = generateTransactionRef();

    const updated = await db.escrowTransaction.update({
      where: { id },
      data: {
        moveInConfirmedAt: now,
        escrowStatus: "RELEASED",
        escrowReleasedAt: now,
        payoutSentAt,
        payoutReference,
      },
      include: {
        listing: { select: { id: true, title: true, address: true, photos: { take: 1, orderBy: { order: "asc" } } } },
        tenant: { select: { id: true, firstName: true, lastName: true, email: true } },
        landlord: { select: { id: true, firstName: true, lastName: true, email: true } },
        agreement: true,
        moveInRecord: true,
        dispute: true,
      },
    });

    return NextResponse.json({
      transaction: {
        ...updated,
        rentAmount: updated.rentAmount.toString(),
        cautionAmount: updated.cautionAmount.toString(),
        safeRentFee: updated.safeRentFee.toString(),
        documentFee: updated.documentFee.toString(),
        totalAmount: updated.totalAmount.toString(),
        agreement: updated.agreement
          ? {
              ...updated.agreement,
              rentAmount: updated.agreement.rentAmount.toString(),
              cautionDeposit: updated.agreement.cautionDeposit.toString(),
            }
          : null,
        dispute: null,
      },
    });
  } catch (err) {
    console.error("Failed to confirm move-in:", err);
    return NextResponse.json({ error: "Failed to confirm move-in" }, { status: 500 });
  }
}
