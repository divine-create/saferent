import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role") ?? session.user.role;

  try {
    const where =
      role === "LANDLORD"
        ? { landlordId: session.user.id }
        : { tenantId: session.user.id };

    const transactions = await db.escrowTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            area: true,
            state: true,
            photos: { take: 1, orderBy: { order: "asc" } },
          },
        },
        tenant: { select: { id: true, firstName: true, lastName: true, email: true } },
        landlord: { select: { id: true, firstName: true, lastName: true, email: true } },
        agreement: true,
        moveInRecord: true,
        dispute: true,
      },
    });

    const serialized = transactions.map((t) => ({
      ...t,
      rentAmount: t.rentAmount.toString(),
      cautionAmount: t.cautionAmount.toString(),
      safeRentFee: t.safeRentFee.toString(),
      documentFee: t.documentFee.toString(),
      totalAmount: t.totalAmount.toString(),
      agreement: t.agreement
        ? {
            ...t.agreement,
            rentAmount: t.agreement.rentAmount.toString(),
            cautionDeposit: t.agreement.cautionDeposit.toString(),
          }
        : null,
      dispute: t.dispute
        ? {
            ...t.dispute,
            refundAmount: t.dispute.refundAmount?.toString() ?? null,
          }
        : null,
    }));

    return NextResponse.json({ transactions: serialized });
  } catch (err) {
    console.error("Failed to fetch transactions:", err);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
