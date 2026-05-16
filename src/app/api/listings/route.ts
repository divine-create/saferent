import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { listingSchema } from "@/lib/validations/listing";
import { mockListings } from "@/lib/mock-listings";
import type { Prisma } from "@prisma/client";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q") ?? "";
  const state = searchParams.get("state") ?? "";
  const lga = searchParams.get("lga") ?? "";
  const propertyType = searchParams.get("propertyType") ?? "";
  const minBedrooms = searchParams.get("minBedrooms");
  const maxBedrooms = searchParams.get("maxBedrooms");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const furnishing = searchParams.get("furnishing") ?? "";
  const letType = searchParams.get("letType") ?? "";
  const amenitiesParam = searchParams.get("amenities") ?? "";
  const isVerifiedParam = searchParams.get("isVerified");
  const sortParam = searchParams.get("sort") ?? "newest";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const skip = (page - 1) * limit;

  try {
    const where: Prisma.ListingWhereInput = {
      status: { in: ["VERIFIED_ACTIVE", "UNVERIFIED_ACTIVE"] },
    };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { area: { contains: q, mode: "insensitive" } },
        { address: { contains: q, mode: "insensitive" } },
        { lga: { contains: q, mode: "insensitive" } },
      ];
    }
    if (state) where.state = { equals: state, mode: "insensitive" };
    if (lga) where.lga = { equals: lga, mode: "insensitive" };
    if (propertyType) where.propertyType = propertyType as Prisma.EnumPropertyTypeFilter["equals"];
    if (minBedrooms) where.bedrooms = { ...((where.bedrooms as object) ?? {}), gte: parseInt(minBedrooms) };
    if (maxBedrooms) where.bedrooms = { ...((where.bedrooms as object) ?? {}), lte: parseInt(maxBedrooms) };
    if (minPrice) where.annualRent = { ...((where.annualRent as object) ?? {}), gte: BigInt(minPrice) };
    if (maxPrice) where.annualRent = { ...((where.annualRent as object) ?? {}), lte: BigInt(maxPrice) };
    if (furnishing) where.furnishingStatus = furnishing as Prisma.EnumFurnishingStatusFilter["equals"];
    if (letType) where.letType = letType as Prisma.EnumLetTypeFilter["equals"];
    if (isVerifiedParam === "true") where.isVerified = true;
    if (isVerifiedParam === "false") where.isVerified = false;
    if (amenitiesParam) {
      const amenityList = amenitiesParam.split(",").map((a) => a.trim()).filter(Boolean);
      if (amenityList.length > 0) {
        where.amenities = { hasEvery: amenityList };
      }
    }

    let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: "desc" };
    if (sortParam === "price_asc") orderBy = { annualRent: "asc" };
    else if (sortParam === "price_desc") orderBy = { annualRent: "desc" };
    else if (sortParam === "most_viewed") orderBy = { viewCount: "desc" };

    const [listings, total] = await Promise.all([
      db.listing.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          photos: { orderBy: { order: "asc" }, take: 1 },
          owner: { select: { id: true, firstName: true, lastName: true, landlordVerification: { select: { badgeTier: true } } } },
        },
      }),
      db.listing.count({ where }),
    ]);

    // Convert BigInt to number for JSON serialization
    const serialized = listings.map((l) => ({
      ...l,
      annualRent: Number(l.annualRent),
      cautionDeposit: l.cautionDeposit ? Number(l.cautionDeposit) : null,
      serviceCharge: l.serviceCharge ? Number(l.serviceCharge) : null,
      agencyFee: l.agencyFee ? Number(l.agencyFee) : null,
    }));

    return NextResponse.json({
      listings: serialized,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("DB error, falling back to mock data:", err);

    // Apply basic filters to mock data
    let filtered = [...mockListings];
    if (q) {
      const qLower = q.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.title.toLowerCase().includes(qLower) ||
          l.area.toLowerCase().includes(qLower) ||
          l.lga.toLowerCase().includes(qLower) ||
          l.address.toLowerCase().includes(qLower)
      );
    }
    if (state) filtered = filtered.filter((l) => l.state.toLowerCase() === state.toLowerCase());
    if (lga) filtered = filtered.filter((l) => l.lga.toLowerCase() === lga.toLowerCase());
    if (propertyType) filtered = filtered.filter((l) => l.propertyType === propertyType);
    if (minBedrooms) filtered = filtered.filter((l) => l.bedrooms >= parseInt(minBedrooms));
    if (maxBedrooms) filtered = filtered.filter((l) => l.bedrooms <= parseInt(maxBedrooms));
    if (minPrice) filtered = filtered.filter((l) => l.annualRent >= parseInt(minPrice));
    if (maxPrice) filtered = filtered.filter((l) => l.annualRent <= parseInt(maxPrice));
    if (furnishing) filtered = filtered.filter((l) => l.furnishingStatus === furnishing);
    if (letType) filtered = filtered.filter((l) => l.letType === letType);
    if (isVerifiedParam === "true") filtered = filtered.filter((l) => l.isVerified);
    if (isVerifiedParam === "false") filtered = filtered.filter((l) => !l.isVerified);

    if (sortParam === "price_asc") filtered.sort((a, b) => a.annualRent - b.annualRent);
    else if (sortParam === "price_desc") filtered.sort((a, b) => b.annualRent - a.annualRent);
    else if (sortParam === "most_viewed") filtered.sort((a, b) => b.viewCount - a.viewCount);
    else filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);

    return NextResponse.json({
      listings: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "LANDLORD" && session.user.role !== "AGENT") {
    return NextResponse.json({ error: "Only landlords and agents can create listings" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = listingSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", issues: result.error.issues }, { status: 422 });
  }

  const data = result.data;
  const id = generateId();
  const baseSlug = slugify(data.title);
  const slug = `${baseSlug}-${id}`;
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

  try {
    const listing = await db.listing.create({
      data: {
        title: data.title,
        description: data.description,
        slug,
        ownerId: session.user.id,
        agentId: session.user.role === "AGENT" ? session.user.id : undefined,
        propertyType: data.propertyType,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        toilets: data.toilets,
        floorLevel: data.floorLevel,
        furnishingStatus: data.furnishingStatus,
        letType: data.letType,
        propertyCondition: data.propertyCondition,
        yearBuilt: data.yearBuilt,
        availableFrom: new Date(data.availableFrom),
        address: data.address,
        area: data.area,
        lga: data.lga,
        state: data.state,
        latitude: data.latitude,
        longitude: data.longitude,
        landmark: data.landmark,
        neighbourhoodDescription: data.neighbourhoodDescription,
        annualRent: BigInt(data.annualRent),
        cautionDeposit: data.cautionDeposit ? BigInt(data.cautionDeposit) : undefined,
        serviceCharge: data.serviceCharge ? BigInt(data.serviceCharge) : undefined,
        agencyFee: data.agencyFee ? BigInt(data.agencyFee) : undefined,
        paymentFrequencies: data.paymentFrequencies,
        amenities: data.amenities,
        videoUrl: data.videoUrl || undefined,
        virtualTourUrl: data.virtualTourUrl || undefined,
        titleDocumentUrl: data.titleDocumentUrl,
        surveyPlanUrl: data.surveyPlanUrl,
        status: "UNVERIFIED_ACTIVE",
        expiresAt,
      },
    });

    return NextResponse.json(
      {
        listing: {
          ...listing,
          annualRent: Number(listing.annualRent),
          cautionDeposit: listing.cautionDeposit ? Number(listing.cautionDeposit) : null,
          serviceCharge: listing.serviceCharge ? Number(listing.serviceCharge) : null,
          agencyFee: listing.agencyFee ? Number(listing.agencyFee) : null,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Failed to create listing:", err);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}
