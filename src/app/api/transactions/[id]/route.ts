import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const transaction = await db.escrowTransaction.findUnique({
      where: { id },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            area: true,
            lga: true,
            state: true,
            propertyType: true,
            bedrooms: true,
            bathrooms: true,
            photos: { take: 1, orderBy: { order: "asc" } },
          },
        },
        tenant: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        landlord: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        agreement: true,
        moveInRecord: true,
        dispute: true,
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Ensure the user is a party to the transaction
    if (
      transaction.tenantId !== session.user.id &&
      transaction.landlordId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const serialized = {
      ...transaction,
      rentAmount: transaction.rentAmount.toString(),
      cautionAmount: transaction.cautionAmount.toString(),
      safeRentFee: transaction.safeRentFee.toString(),
      documentFee: transaction.documentFee.toString(),
      totalAmount: transaction.totalAmount.toString(),
      agreement: transaction.agreement
        ? {
            ...transaction.agreement,
            rentAmount: transaction.agreement.rentAmount.toString(),
            cautionDeposit: transaction.agreement.cautionDeposit.toString(),
          }
        : null,
      dispute: transaction.dispute
        ? {
            ...transaction.dispute,
            refundAmount: transaction.dispute.refundAmount?.toString() ?? null,
          }
        : null,
    };

    return NextResponse.json({ transaction: serialized });
  } catch (err) {
    console.error("Failed to fetch transaction:", err);
    return NextResponse.json({ error: "Failed to fetch transaction" }, { status: 500 });
  }
}
