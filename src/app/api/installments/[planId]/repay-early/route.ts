import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateTransactionRef } from "@/lib/utils";

type RouteContext = { params: Promise<{ planId: string }> };

export async function POST(_req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { planId } = await params;

  try {
    const plan = await db.installmentPlan.findUnique({
      where: { id: planId },
      include: { installments: { where: { status: { notIn: ["PAID"] } } } },
    });
    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    if (plan.tenantId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (plan.status === "completed") {
      return NextResponse.json({ error: "Plan already completed" }, { status: 400 });
    }

    const remainingInstallments = plan.installments;
    const remainingPrincipal = remainingInstallments.reduce(
      (sum, i) => sum + i.amount,
      BigInt(0)
    );
    // Interest saving: proportional to remaining months
    const monthsRemaining = remainingInstallments.length;
    const interestSaving = (plan.totalInterest * BigInt(monthsRemaining)) / BigInt(12);
    const earlyRepaymentAmount = remainingPrincipal - interestSaving;

    // Mark all remaining installments as paid
    const ref = generateTransactionRef();
    await db.installment.updateMany({
      where: { planId, status: { notIn: ["PAID"] } },
      data: {
        status: "PAID",
        paidAt: new Date(),
        paidAmount: earlyRepaymentAmount / BigInt(monthsRemaining),
        reference: ref,
      },
    });

    await db.installmentPlan.update({
      where: { id: planId },
      data: { status: "completed" },
    });

    return NextResponse.json({
      message: "Early repayment successful",
      amountPaid: earlyRepaymentAmount.toString(),
      interestSaved: interestSaving.toString(),
      installmentsPaidOff: monthsRemaining,
    });
  } catch (err) {
    console.error("Failed to process early repayment:", err);
    return NextResponse.json({ error: "Early repayment failed" }, { status: 500 });
  }
}
