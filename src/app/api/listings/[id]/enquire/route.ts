import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const enquirySchema = z.object({
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

export async function POST(req: NextRequest, context: RouteContext) {
  const { id: listingId } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = enquirySchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", issues: result.error.issues }, { status: 422 });
  }

  try {
    const listing = await db.listing.findUnique({ where: { id: listingId }, select: { id: true } });
    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    const enquiry = await db.enquiry.create({
      data: {
        userId: session.user.id,
        listingId,
        message: result.data.message,
      },
    });

    // Increment enquiry count
    db.listing.update({ where: { id: listingId }, data: { enquiryCount: { increment: 1 } } }).catch(() => {});

    return NextResponse.json({ enquiry }, { status: 201 });
  } catch (err) {
    console.error("Failed to create enquiry:", err);
    return NextResponse.json({ error: "Failed to send enquiry" }, { status: 500 });
  }
}
