import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const INTEREST_RATE = 0.21; // 21% per annum
const MAX_FIRST_TIME = BigInt(300_000_000); // ₦3,000,000 in kobo

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "TENANT") {
    return NextResponse.json({ error: "Only tenants can apply for installment plans" }, { status: 403 });
  }

  // Eligibility checks
  if (session.user.trustScore < 80) {
    return NextResponse.json(
      { error: "Trust score of 80+ required for installment payments" },
      { status: 400 }
    );
  }

  const body = await req.json() as {
    transactionId: string;
    totalAmount: string;
    debitDay: number;
    startDate: string;
  };
  const { transactionId, totalAmount, debitDay, startDate } = body;

  if (!transactionId || !totalAmount || !debitDay || !startDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Check for active disputes
    const disputes = await db.dispute.findFirst({
      where: {
        transaction: { tenantId: session.user.id },
        status: { notIn: ["RESOLVED"] },
      },
    });
    if (disputes) {
      return NextResponse.json({ error: "Cannot apply while you have active disputes" }, { status: 400 });
    }

    // Check first-time limit
    const existingPlans = await db.installmentPlan.count({
      where: { tenantId: session.user.id },
    });
    const totalBigInt = BigInt(totalAmount);
    if (existingPlans === 0 && totalBigInt > MAX_FIRST_TIME) {
      return NextResponse.json(
        { error: "First-time installment limit is ₦3,000,000" },
        { status: 400 }
      );
    }

    // Check employment verified
    const profile = await db.userProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile?.payslipUploaded && !profile?.bankStatementUploaded) {
      return NextResponse.json(
        { error: "Employment verification required for installment plans" },
        { status: 400 }
      );
    }

    // Calculate plan
    const monthlyAmount = totalBigInt / BigInt(12);
    const totalInterest = BigInt(Math.round(Number(totalBigInt) * INTEREST_RATE));
    const totalRepayable = totalBigInt + totalInterest;
    const monthlyRepayable = totalRepayable / BigInt(12);

    const start = new Date(startDate);

    // Create the plan and 12 installments
    const plan = await db.installmentPlan.create({
      data: {
        transactionId,
        tenantId: session.user.id,
        totalAmount: totalBigInt,
        monthlyAmount,
        interestRate: INTEREST_RATE,
        totalInterest,
        totalRepayable,
        debitDay,
        startDate: start,
        installments: {
          create: Array.from({ length: 12 }, (_, i) => {
            const dueDate = new Date(start);
            dueDate.setMonth(dueDate.getMonth() + i);
            dueDate.setDate(debitDay);
            return {
              tenantId: session.user.id,
              installmentNumber: i + 1,
              dueDate,
              amount: monthlyRepayable,
            };
          }),
        },
      },
      include: { installments: true },
    });

    return NextResponse.json(
      {
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
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Failed to create installment plan:", err);
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
  }
}
