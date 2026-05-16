import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const bodySchema = z.object({
  listingId: z.string().min(1),
  proposedSlots: z
    .array(z.object({ date: z.string(), time: z.string() }))
    .min(1)
    .max(3),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "TENANT") {
    return NextResponse.json({ error: "Only tenants can book viewings" }, { status: 403 });
  }

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

  const { listingId, proposedSlots, notes } = result.data;

  try {
    const listing = await db.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const viewing = await db.viewingBooking.create({
      data: {
        listingId,
        tenantId: session.user.id,
        proposedSlots,
        notes,
        status: "REQUESTED",
      },
      include: {
        listing: { select: { id: true, title: true, address: true } },
        tenant: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    return NextResponse.json({ viewing }, { status: 201 });
  } catch (err) {
    console.error("Failed to book viewing:", err);
    return NextResponse.json({ error: "Failed to book viewing" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role") ?? session.user.role;

  try {
    const where =
      role === "LANDLORD" || role === "AGENT"
        ? { listing: { ownerId: session.user.id } }
        : { tenantId: session.user.id };

    const viewings = await db.viewingBooking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        listing: { select: { id: true, title: true, address: true, area: true, state: true } },
        tenant: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    return NextResponse.json({ viewings });
  } catch (err) {
    console.error("Failed to fetch viewings:", err);
    return NextResponse.json({ error: "Failed to fetch viewings" }, { status: 500 });
  }
}
