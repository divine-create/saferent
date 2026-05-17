import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateUserTrustScore } from "@/lib/trust-score";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.user.update({
    where: { id: session.user.id },
    data: { onboardingComplete: true, idDocumentStatus: "PENDING" },
  });

  await db.landlordVerification.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: {},
  });

  const result = await calculateUserTrustScore(session.user.id);
  await db.user.update({
    where: { id: session.user.id },
    data: { trustScore: result.score },
  });

  return NextResponse.json({ success: true, trustScore: result.score });
}
