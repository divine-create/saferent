import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { idType, employment, employerName } = await req.json();

  await db.user.update({
    where: { id: session.user.id },
    data: { onboardingComplete: true },
  });

  await db.userProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, employmentStatus: employment, employerName: employerName || null, governmentIdType: idType },
    update: { employmentStatus: employment, employerName: employerName || null, governmentIdType: idType },
  });

  return NextResponse.json({ success: true });
}
