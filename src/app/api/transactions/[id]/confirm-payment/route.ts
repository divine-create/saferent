import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const transaction = await db.escrowTransaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (
      transaction.tenantId !== session.user.id &&
      transaction.landlordId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (transaction.escrowStatus !== "PENDING_PAYMENT") {
      return NextResponse.json(
        { error: "Transaction is not in PENDING_PAYMENT status" },
        { status: 400 }
      );
    }

    const autoReleaseAt = new Date(transaction.moveInDate);
    autoReleaseAt.setHours(autoReleaseAt.getHours() + 72);

    const updated = await db.escrowTransaction.update({
      where: { id },
      data: {
        escrowStatus: "FUNDED",
        paymentDate: new Date(),
        autoReleaseAt,
        listing: {
          update: {
            status: "LET_AGREED",
          },
        },
      },
      include: {
        listing: {
          select: { id: true, title: true, address: true, photos: { take: 1, orderBy: { order: "asc" } } },
        },
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
    console.error("Failed to confirm payment:", err);
    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 });
  }
}
