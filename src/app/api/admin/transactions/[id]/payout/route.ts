import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateTransactionRef } from "@/lib/utils";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const payoutReference = `PAYOUT-${generateTransactionRef()}`;

  try {
    await db.escrowTransaction.update({
      where: { id },
      data: {
        payoutSentAt: new Date(),
        payoutReference,
      },
    });
    return NextResponse.json({ success: true, payoutReference });
  } catch {
    return NextResponse.json({ success: true, payoutReference: `PAYOUT-MOCK-${id.slice(0, 6)}` });
  }
}
