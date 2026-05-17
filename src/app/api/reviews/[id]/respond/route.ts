import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as { response: string };

  if (!body.response?.trim()) {
    return NextResponse.json({ error: "Response text required" }, { status: 400 });
  }

  try {
    const review = await db.review.findUnique({ where: { id } });
    if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (review.revieweeId !== session.user.id) {
      return NextResponse.json({ error: "Only the reviewee can respond" }, { status: 403 });
    }

    const updated = await db.review.update({
      where: { id },
      data: { response: body.response },
    });
    return NextResponse.json({ review: updated });
  } catch (err) {
    console.error("Failed to add response:", err);
    return NextResponse.json({ error: "Failed to add response" }, { status: 500 });
  }
}
