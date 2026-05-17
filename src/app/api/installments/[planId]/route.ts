import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

type RouteContext = { params: Promise<{ planId: string }> };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { planId } = await params;

  try {
    const plan = await db.installmentPlan.findUnique({
      where: { id: planId },
      include: { installments: { orderBy: { installmentNumber: "asc" } } },
    });
    if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (plan.tenantId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      plan: {
        ...plan,
        totalAmount: plan.totalAmount.toString(),
        monthlyAmount: plan.monthlyAmount.toString(),
        totalInterest: plan.totalInterest.toString(),
        totalRepayable: plan.totalRepayable.toString(),
        installments: plan.installments.map((i) => ({
          ...i,
          amount: i.amount.toString(),
          paidAmount: i.paidAmount?.toString() ?? null,
        })),
      },
    });
  } catch (err) {
    console.error("Failed to fetch installment plan:", err);
    return NextResponse.json({ error: "Failed to fetch plan" }, { status: 500 });
  }
}
