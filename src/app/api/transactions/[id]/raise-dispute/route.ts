import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  category: z.enum(["NOT_AS_DESCRIBED", "NOT_ACCESSIBLE", "MAJOR_DEFECT", "CAUTION_DEPOSIT", "FRAUDULENT_LISTING"]),
  description: z.string().min(50, "Description must be at least 50 characters"),
});

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "TENANT") {
    return NextResponse.json({ error: "Only tenants can raise disputes" }, { status: 403 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = bodySchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", issues: result.error.issues }, { status: 422 });
  }

  const { category, description } = result.data;

  try {
    const transaction = await db.escrowTransaction.findUnique({
      where: { id },
      include: { dispute: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (transaction.tenantId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (transaction.dispute) {
      return NextResponse.json({ error: "A dispute already exists for this transaction" }, { status: 409 });
    }

    if (transaction.escrowStatus !== "FUNDED" && transaction.escrowStatus !== "RELEASED") {
      return NextResponse.json(
        { error: "Dispute can only be raised on a funded or recently released transaction" },
        { status: 400 }
      );
    }

    // Validate 72h window after move-in confirmation (if confirmed)
    if (transaction.moveInConfirmedAt) {
      const windowEnd = new Date(transaction.moveInConfirmedAt);
      windowEnd.setHours(windowEnd.getHours() + 72);
      if (new Date() > windowEnd) {
        return NextResponse.json(
          { error: "The 72-hour dispute window has closed" },
          { status: 400 }
        );
      }
    }

    const now = new Date();
    const evidenceDeadline = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const mediationDeadline = new Date(now.getTime() + 72 * 60 * 60 * 1000);
    const adjudicationDeadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [dispute] = await Promise.all([
      db.dispute.create({
        data: {
          transactionId: id,
          raisedById: session.user.id,
          category,
          description,
          status: "OPEN",
          evidenceDeadline,
          mediationDeadline,
          adjudicationDeadline,
        },
      }),
      db.escrowTransaction.update({
        where: { id },
        data: { escrowStatus: "DISPUTED" },
      }),
    ]);

    return NextResponse.json({ dispute }, { status: 201 });
  } catch (err) {
    console.error("Failed to raise dispute:", err);
    return NextResponse.json({ error: "Failed to raise dispute" }, { status: 500 });
  }
}
