import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateTransactionRef } from "@/lib/utils";

type RouteContext = { params: Promise<{ planId: string }> };

export async function POST(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { planId } = await params;
  const body = await req.json() as { installmentId: string };
  const { installmentId } = body;

  if (!installmentId) {
    return NextResponse.json({ error: "installmentId required" }, { status: 400 });
  }

  try {
    const plan = await db.installmentPlan.findUnique({ where: { id: planId } });
    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    if (plan.tenantId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const installment = await db.installment.findUnique({ where: { id: installmentId } });
    if (!installment) return NextResponse.json({ error: "Installment not found" }, { status: 404 });
    if (installment.planId !== planId) {
      return NextResponse.json({ error: "Installment does not belong to this plan" }, { status: 400 });
    }
    if (installment.status === "PAID") {
      return NextResponse.json({ error: "Already paid" }, { status: 400 });
    }

    const updated = await db.installment.update({
      where: { id: installmentId },
      data: {
        status: "PAID",
        paidAt: new Date(),
        paidAmount: installment.amount,
        reference: generateTransactionRef(),
      },
    });

    // Check if all installments are paid
    const remaining = await db.installment.count({
      where: { planId, status: { notIn: ["PAID"] } },
    });
    if (remaining === 0) {
      await db.installmentPlan.update({ where: { id: planId }, data: { status: "completed" } });
    }

    return NextResponse.json({
      installment: {
        ...updated,
        amount: updated.amount.toString(),
        paidAmount: updated.paidAmount?.toString() ?? null,
      },
    });
  } catch (err) {
    console.error("Failed to process installment payment:", err);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}
