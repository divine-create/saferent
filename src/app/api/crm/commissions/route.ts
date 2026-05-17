import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { mockCommissions } from "@/lib/mock-crm";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "AGENT") {
    return NextResponse.json({ error: "Only agents can view commissions" }, { status: 403 });
  }

  try {
    const commissions = await db.agentCommission.findMany({
      where: { agentId: session.user.id },
      include: {
        transaction: {
          include: {
            listing: { select: { title: true, address: true } },
            tenant: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    const serialized = commissions.map((c) => ({
      ...c,
      amount: c.amount.toString(),
      transaction: {
        ...c.transaction,
        rentAmount: c.transaction.rentAmount.toString(),
        cautionAmount: c.transaction.cautionAmount.toString(),
        safeRentFee: c.transaction.safeRentFee.toString(),
        documentFee: c.transaction.documentFee.toString(),
        totalAmount: c.transaction.totalAmount.toString(),
      },
    }));
    return NextResponse.json({ commissions: serialized });
  } catch {
    return NextResponse.json({ commissions: mockCommissions });
  }
}
