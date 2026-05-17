import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const STATUS_ORDER = ["OPEN", "EVIDENCE_COLLECTION", "MEDIATION", "ADJUDICATION", "RESOLVED"] as const;
type DisputeStatusVal = (typeof STATUS_ORDER)[number];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json() as {
    action: "advance_stage" | "resolve";
    outcome?: string;
    resolution?: string;
    refundAmount?: number;
  };

  try {
    const dispute = await db.dispute.findUnique({ where: { id } });
    if (!dispute) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (body.action === "advance_stage") {
      const currentIdx = STATUS_ORDER.indexOf(dispute.status as DisputeStatusVal);
      const nextStatus = STATUS_ORDER[currentIdx + 1];
      if (!nextStatus || nextStatus === "RESOLVED") {
        return NextResponse.json({ error: "Cannot advance further" }, { status: 400 });
      }
      await db.dispute.update({ where: { id }, data: { status: nextStatus } });
      return NextResponse.json({ success: true, status: nextStatus });
    }

    if (body.action === "resolve") {
      if (!body.outcome || !body.resolution) {
        return NextResponse.json({ error: "outcome and resolution required" }, { status: 400 });
      }
      await db.dispute.update({
        where: { id },
        data: {
          status: "RESOLVED",
          outcome: body.outcome as never,
          resolution: body.resolution,
          resolvedAt: new Date(),
          refundAmount: body.refundAmount ? BigInt(Math.round(body.refundAmount * 100)) : null,
        },
      });
      // Update escrow status
      await db.escrowTransaction.update({
        where: { id: dispute.transactionId },
        data: {
          escrowStatus: body.outcome === "FULL_REFUND_TENANT" ? "REFUNDED" : "RELEASED",
        },
      });
      return NextResponse.json({ success: true, status: "RESOLVED" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Dispute action failed:", err);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
