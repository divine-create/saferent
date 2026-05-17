import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { calculateUserTrustScore } from "@/lib/trust-score";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Admins can specify a userId, others can only recalculate their own
  const body = await req.json().catch(() => ({})) as { userId?: string };
  const targetUserId =
    session.user.role === "ADMIN" && body.userId ? body.userId : session.user.id;

  try {
    const result = await calculateUserTrustScore(targetUserId);

    // Persist the calculated score
    await db.user.update({
      where: { id: targetUserId },
      data: { trustScore: result.score },
    });

    return NextResponse.json({ ...result, savedScore: result.score });
  } catch (err) {
    console.error("Failed to recalculate trust score:", err);
    return NextResponse.json({ error: "Failed to recalculate" }, { status: 500 });
  }
}
