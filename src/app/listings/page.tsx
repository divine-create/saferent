import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { mockListings } from "@/lib/mock-listings";
import { SearchFilters } from "@/components/listings/SearchFilters";
import { ListingGrid } from "@/components/listings/ListingGrid";
import type { ListingCardData } from "@/components/listings/ListingCard";
import type { Prisma } from "@prisma/client";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getString(val: string | string[] | undefined): string {
  return Array.isArray(val) ? val[0] : val ?? "";
}

async function getListings(searchParams: Record<string, string | string[] | undefined>) {
  const q = getString(searchParams.q);
  const state = getString(searchParams.state);
  const lga = getString(searchParams.lga);
  const propertyTypeRaw = getString(searchParams.propertyType);
  const minBedrooms = getString(searchParams.minBedrooms);
  const minPrice = getString(searchParams.minPrice);
  const maxPrice = getString(searchParams.maxPrice);
  const furnishing = getString(searchParams.furnishing);
  const letType = getString(searchParams.letType);
  const amenitiesParam = getString(searchParams.amenities);
  const isVerifiedParam = getString(searchParams.isVerified);
  const sortParam = getString(searchParams.sort) || "newest";
  const page = Math.max(1, parseInt(getString(searchParams.page) || "1", 10));
  const limit = 20;
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
    if (propertyTypeRaw) {
      const types = propertyTypeRaw.split(",").filter(Boolean) as Array<Prisma.EnumPropertyTypeFilter["equals"]>;
      if (types.length === 1) {
        where.propertyType = types[0];
      } else if (types.length > 1) {
        where.propertyType = { in: types.filter((t): t is NonNullable<typeof t> => t !== undefined) };
      }
    }
    if (minBedrooms) where.bedrooms = { gte: parseInt(minBedrooms) };
    if (minPrice) where.annualRent = { gte: BigInt(minPrice) };
    if (maxPrice) {
      const existingRent = where.annualRent as Record<string, unknown> | undefined;
      where.annualRent = { ...(existingRent ?? {}), lte: BigInt(maxPrice) };
    }
    if (furnishing) where.furnishingStatus = furnishing as Prisma.EnumFurnishingStatusFilter["equals"];
    if (letType) where.letType = letType as Prisma.EnumLetTypeFilter["equals"];
    if (isVerifiedParam === "true") where.isVerified = true;
    if (amenitiesParam) {
      const amenityList = amenitiesParam.split(",").map((a) => a.trim()).filter(Boolean);
      if (amenityList.length > 0) where.amenities = { hasEvery: amenityList };
    }

    let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: "desc" };
    if (sortParam === "price_asc") orderBy = { annualRent: "asc" };
    else if (sortParam === "price_desc") orderBy = { annualRent: "desc" };
    else if (sortParam === "most_viewed") orderBy = { viewCount: "desc" };

    const [rawListings, total] = await Promise.all([
      db.listing.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          photos: { orderBy: { order: "asc" }, take: 1 },
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              landlordVerification: { select: { badgeTier: true } },
            },
          },
        },
      }),
      db.listing.count({ where }),
    ]);

    const listings: ListingCardData[] = rawListings.map((l) => ({
      id: l.id,
      title: l.title,
      slug: l.slug,
      propertyType: l.propertyType,
      bedrooms: l.bedrooms,
      bathrooms: l.bathrooms,
      area: l.area,
      lga: l.lga,
      state: l.state,
      annualRent: Number(l.annualRent),
      paymentFrequencies: l.paymentFrequencies,
      furnishingStatus: l.furnishingStatus,
      isVerified: l.isVerified,
      status: l.status,
      photos: l.photos,
      owner: {
        id: l.owner.id,
        firstName: l.owner.firstName,
        lastName: l.owner.lastName,
        landlordVerification: l.owner.landlordVerification,
      },
    }));

    return { listings, total, page, totalPages: Math.ceil(total / limit) };
  } catch {
    // Fall back to mock data
    let filtered = [...mockListings];
    if (q) {
      const qLower = q.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.title.toLowerCase().includes(qLower) ||
          l.area.toLowerCase().includes(qLower) ||
          l.lga.toLowerCase().includes(qLower)
      );
    }
    if (state) filtered = filtered.filter((l) => l.state.toLowerCase() === state.toLowerCase());
    if (isVerifiedParam === "true") filtered = filtered.filter((l) => l.isVerified);

    if (sortParam === "price_asc") filtered.sort((a, b) => a.annualRent - b.annualRent);
    else if (sortParam === "price_desc") filtered.sort((a, b) => b.annualRent - a.annualRent);

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);
    const listings: ListingCardData[] = paginated.map((l) => ({
      id: l.id,
      title: l.title,
      slug: l.slug,
      propertyType: l.propertyType,
      bedrooms: l.bedrooms,
      bathrooms: l.bathrooms,
      area: l.area,
      lga: l.lga,
      state: l.state,
      annualRent: l.annualRent,
      paymentFrequencies: l.paymentFrequencies,
      furnishingStatus: l.furnishingStatus,
      isVerified: l.isVerified,
      status: l.status,
      photos: l.photos,
      owner: l.owner,
    }));

    return { listings, total, page, totalPages: Math.ceil(total / limit) };
  }
}

export default async function ListingsPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams;
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session;

  const { listings, total, page, totalPages } = await getListings(resolvedParams);

  // Build searchParams record for pagination links
  const paramRecord: Record<string, string> = {};
  for (const [k, v] of Object.entries(resolvedParams)) {
    if (v && k !== "page") paramRecord[k] = Array.isArray(v) ? v[0] : v;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Find Your Next Home
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {total.toLocaleString()} verified rental properties across Nigeria
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <Suspense>
          <SearchFilters />
        </Suspense>

        {/* Results */}
        <div className="mt-6">
          <ListingGrid
            listings={listings}
            total={total}
            page={page}
            totalPages={totalPages}
            isAuthenticated={isAuthenticated}
            searchParams={paramRecord}
          />
        </div>
      </div>
    </div>
  );
}
