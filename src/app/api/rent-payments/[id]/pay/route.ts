import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateTransactionRef } from "@/lib/utils";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "TENANT") {
    return NextResponse.json({ error: "Only tenants can make payments" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const payment = await db.rentPayment.findUnique({ where: { id } });
    if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    if (payment.tenantId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (payment.status === "paid") {
      return NextResponse.json({ error: "Already paid" }, { status: 400 });
    }

    const updated = await db.rentPayment.update({
      where: { id },
      data: {
        status: "paid",
        paidAt: new Date(),
        paidAmount: payment.amount,
        paymentMethod: "BANK_TRANSFER",
        reference: generateTransactionRef(),
      },
    });

    return NextResponse.json({
      payment: {
        ...updated,
        amount: updated.amount.toString(),
        paidAmount: updated.paidAmount?.toString() ?? null,
        lateFee: updated.lateFee?.toString() ?? null,
      },
    });
  } catch (err) {
    console.error("Failed to process rent payment:", err);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}
