import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { listingUpdateSchema } from "@/lib/validations/listing";
import { mockListings } from "@/lib/mock-listings";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const listing = await db.listing.findUnique({
      where: { id },
      include: {
        photos: { orderBy: { order: "asc" } },
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
            createdAt: true,
            landlordVerification: { select: { badgeTier: true } },
          },
        },
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
            agentProfile: { select: { businessName: true, subscriptionPlan: true } },
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Increment view count (fire and forget)
    db.listing.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

    return NextResponse.json({
      listing: {
        ...listing,
        annualRent: Number(listing.annualRent),
        cautionDeposit: listing.cautionDeposit ? Number(listing.cautionDeposit) : null,
        serviceCharge: listing.serviceCharge ? Number(listing.serviceCharge) : null,
        agencyFee: listing.agencyFee ? Number(listing.agencyFee) : null,
      },
    });
  } catch (err) {
    console.error("DB error, falling back to mock data:", err);

    const mock = mockListings.find((l) => l.id === id || l.slug === id);
    if (!mock) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }
    return NextResponse.json({ listing: mock });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = listingUpdateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", issues: result.error.issues }, { status: 422 });
  }

  try {
    const listing = await db.listing.findUnique({ where: { id }, select: { ownerId: true } });
    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    if (listing.ownerId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = result.data;
    const updated = await db.listing.update({
      where: { id },
      data: {
        ...data,
        annualRent: data.annualRent ? BigInt(data.annualRent) : undefined,
        cautionDeposit: data.cautionDeposit ? BigInt(data.cautionDeposit) : undefined,
        serviceCharge: data.serviceCharge ? BigInt(data.serviceCharge) : undefined,
        agencyFee: data.agencyFee ? BigInt(data.agencyFee) : undefined,
        availableFrom: data.availableFrom ? new Date(data.availableFrom) : undefined,
      },
    });

    return NextResponse.json({
      listing: {
        ...updated,
        annualRent: Number(updated.annualRent),
        cautionDeposit: updated.cautionDeposit ? Number(updated.cautionDeposit) : null,
        serviceCharge: updated.serviceCharge ? Number(updated.serviceCharge) : null,
        agencyFee: updated.agencyFee ? Number(updated.agencyFee) : null,
      },
    });
  } catch (err) {
    console.error("Failed to update listing:", err);
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const listing = await db.listing.findUnique({ where: { id }, select: { ownerId: true } });
    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    if (listing.ownerId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.listing.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete listing:", err);
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
  }
}
