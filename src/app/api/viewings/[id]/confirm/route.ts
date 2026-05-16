import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  confirmedSlot: z.string().refine((d) => !isNaN(Date.parse(d)), { message: "Invalid date" }),
});

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "LANDLORD" && session.user.role !== "AGENT") {
    return NextResponse.json({ error: "Only landlords or agents can confirm viewings" }, { status: 403 });
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

  const { confirmedSlot } = result.data;

  try {
    const viewing = await db.viewingBooking.findUnique({
      where: { id },
      include: { listing: { select: { ownerId: true, agentId: true } } },
    });

    if (!viewing) {
      return NextResponse.json({ error: "Viewing not found" }, { status: 404 });
    }

    if (
      viewing.listing.ownerId !== session.user.id &&
      viewing.listing.agentId !== session.user.id
    ) {
      return NextResponse.json({ error: "You do not own this listing" }, { status: 403 });
    }

    const updated = await db.viewingBooking.update({
      where: { id },
      data: {
        confirmedSlot: new Date(confirmedSlot),
        status: "CONFIRMED",
      },
    });

    return NextResponse.json({ viewing: updated });
  } catch (err) {
    console.error("Failed to confirm viewing:", err);
    return NextResponse.json({ error: "Failed to confirm viewing" }, { status: 500 });
  }
}
