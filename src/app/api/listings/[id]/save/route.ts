import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  const { id: listingId } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  try {
    const existing = await db.savedListing.findUnique({
      where: { userId_listingId: { userId, listingId } },
    });

    if (existing) {
      await db.savedListing.delete({ where: { id: existing.id } });
      return NextResponse.json({ saved: false });
    } else {
      await db.savedListing.create({ data: { userId, listingId } });
      return NextResponse.json({ saved: true });
    }
  } catch (err) {
    console.error("Failed to toggle saved listing:", err);
    return NextResponse.json({ error: "Failed to save listing" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { id: listingId } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ saved: false });

  try {
    const existing = await db.savedListing.findUnique({
      where: { userId_listingId: { userId: session.user.id, listingId } },
    });
    return NextResponse.json({ saved: !!existing });
  } catch {
    return NextResponse.json({ saved: false });
  }
}
