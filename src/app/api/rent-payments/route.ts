import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { mockRentPayments } from "@/lib/mock-property";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tenancyId = searchParams.get("tenancyId");

  if (!tenancyId) {
    return NextResponse.json({ error: "tenancyId required" }, { status: 400 });
  }

  try {
    const payments = await db.rentPayment.findMany({
      where: {
        tenancyId,
        ...(session.user.role === "TENANT" ? { tenantId: session.user.id } : {}),
      },
      orderBy: { dueDate: "asc" },
    });
    const serialized = payments.map((p) => ({
      ...p,
      amount: p.amount.toString(),
      paidAmount: p.paidAmount?.toString() ?? null,
      lateFee: p.lateFee?.toString() ?? null,
    }));
    return NextResponse.json({ payments: serialized });
  } catch {
    const filtered = mockRentPayments.filter((p) => p.tenancyId === tenancyId);
    return NextResponse.json({ payments: filtered });
  }
}
