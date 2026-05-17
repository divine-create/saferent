import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const review = await db.review.findUnique({ where: { id } });
    if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await db.review.update({
      where: { id },
      data: { isFlagged: true },
    });
    return NextResponse.json({ review: updated });
  } catch (err) {
    console.error("Failed to flag review:", err);
    return NextResponse.json({ error: "Failed to flag review" }, { status: 500 });
  }
}
