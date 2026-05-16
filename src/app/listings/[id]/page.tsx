import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { mockListings } from "@/lib/mock-listings";
import { PhotoGallery } from "@/components/listings/PhotoGallery";
import { ListingDetailClient } from "@/components/listings/ListingDetailClient";
import { ListingCard, type ListingCardData } from "@/components/listings/ListingCard";
import {
  MapPin, Building2, Bed, Bath, CheckCircle, Calendar,
  Zap, Droplets, Gauge, Wind, ChefHat, Users as UsersIcon,
  Shield, Waves, Dumbbell, ParkingSquare, ArrowUp, PawPrint,
  User, CalendarDays
} from "lucide-react";
import { formatNaira } from "@/lib/utils";

type PageProps = { params: Promise<{ id: string }> };

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  "Generator": <Zap className="w-4 h-4" />,
  "Borehole": <Droplets className="w-4 h-4" />,
  "Borehole/Water": <Droplets className="w-4 h-4" />,
  "Prepaid Meter": <Gauge className="w-4 h-4" />,
  "Central AC": <Wind className="w-4 h-4" />,
  "Fitted Kitchen": <ChefHat className="w-4 h-4" />,
  "BQ (Boys Quarter)": <UsersIcon className="w-4 h-4" />,
  "Security": <Shield className="w-4 h-4" />,
  "Swimming Pool": <Waves className="w-4 h-4" />,
  "Gym": <Dumbbell className="w-4 h-4" />,
  "Parking": <ParkingSquare className="w-4 h-4" />,
  "Elevator": <ArrowUp className="w-4 h-4" />,
  "Pet-friendly": <PawPrint className="w-4 h-4" />,
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  FLAT: "Flat",
  SELF_CONTAINED: "Self-contained",
  DUPLEX: "Duplex",
  BUNGALOW: "Bungalow",
  TERRACED_HOUSE: "Terraced House",
  DETACHED_HOUSE: "Detached House",
  ROOM_AND_PARLOUR: "Room & Parlour",
  STUDIO: "Studio",
};

const BADGE_TIER_STYLES: Record<string, string> = {
  CERTIFIED: "bg-[#D4A017] text-white",
  PROPERTY_VERIFIED: "bg-[#0F7B5A] text-white",
  ID_VERIFIED: "bg-blue-600 text-white",
  NONE: "bg-gray-200 text-gray-600",
};

async function getListing(id: string) {
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
            agentProfile: { select: { businessName: true } },
          },
        },
      },
    });
    if (!listing) return null;

    // Increment view count
    db.listing.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

    return {
      ...listing,
      annualRent: Number(listing.annualRent),
      cautionDeposit: listing.cautionDeposit ? Number(listing.cautionDeposit) : null,
      serviceCharge: listing.serviceCharge ? Number(listing.serviceCharge) : null,
      agencyFee: listing.agencyFee ? Number(listing.agencyFee) : null,
    };
  } catch {
    // Fall back to mock
    return mockListings.find((l) => l.id === id) ?? null;
  }
}

async function getSimilarListings(id: string, state: string, propertyType: string): Promise<ListingCardData[]> {
  try {
    const raw = await db.listing.findMany({
      where: {
        id: { not: id },
        state,
        propertyType: propertyType as never,
        status: { in: ["VERIFIED_ACTIVE", "UNVERIFIED_ACTIVE"] },
      },
      take: 3,
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
    });
    return raw.map((l) => ({
      id: l.id,
      title: l.title,
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
      owner: { id: l.owner.id, firstName: l.owner.firstName, lastName: l.owner.lastName, landlordVerification: l.owner.landlordVerification },
    }));
  } catch {
    return mockListings
      .filter((l) => l.id !== id && l.state === state)
      .slice(0, 3)
      .map((l) => ({
        id: l.id,
        title: l.title,
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
  }
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [listing, session] = await Promise.all([
    getListing(id),
    getServerSession(authOptions),
  ]);

  if (!listing) notFound();

  const similarListings = await getSimilarListings(id, listing.state, listing.propertyType);

  const saferentFee = Math.round(listing.annualRent * 0.05);
  const documentFee = 8000;
  const totalAtCheckout = listing.annualRent + saferentFee + documentFee;

  const ownerName = [listing.owner.firstName, listing.owner.lastName].filter(Boolean).join(" ") || "Landlord";
  const badgeTier = (listing.owner as { landlordVerification?: { badgeTier: string } | null }).landlordVerification?.badgeTier ?? "NONE";
  const memberSince = listing.owner && "createdAt" in listing.owner
    ? new Date(listing.owner.createdAt as string | Date).getFullYear()
    : null;

  const photos = listing.photos.map((p, i) => ({
    id: "id" in p ? (p.id as string) : String(i),
    url: p.url,
    caption: p.caption ?? null,
    order: "order" in p ? (p.order as number) : i,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo gallery */}
            <PhotoGallery photos={photos} title={listing.title} />

            {/* Title & basic info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
                  <Building2 className="w-3.5 h-3.5" />
                  {PROPERTY_TYPE_LABELS[listing.propertyType] ?? listing.propertyType}
                </span>
                {listing.isVerified ? (
                  <span className="inline-flex items-center gap-1.5 bg-[#0F7B5A] text-white text-xs font-semibold px-3 py-1 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" />
                    SafeRent Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                    Unverified
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                  {listing.furnishingStatus.replace(/_/g, " ")}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                  {listing.letType.replace("_", " ")}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">{listing.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1.5"><Bed className="w-4 h-4" /> {listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms} Bedrooms`}</span>
                <span className="flex items-center gap-1.5"><Bath className="w-4 h-4" /> {listing.bathrooms} Bathrooms</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Available {new Date(listing.availableFrom).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-bold text-gray-900 mb-3">About this property</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{listing.description}</p>
              </div>
            )}

            {/* Amenities */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-bold text-gray-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {listing.amenities.map((amenity: string) => (
                    <div key={amenity} className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl text-sm text-gray-700">
                      <span className="text-[#0F7B5A]">
                        {AMENITY_ICONS[amenity] ?? <CheckCircle className="w-4 h-4" />}
                      </span>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-4">Location</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-[#0F7B5A] shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{listing.address}</p>
                    <p className="mt-0.5">{listing.area}, {listing.lga}, {listing.state}</p>
                  </div>
                </div>
                {"landmark" in listing && listing.landmark && (
                  <p className="text-gray-500 ml-6">📍 Near {listing.landmark as string}</p>
                )}
                {"neighbourhoodDescription" in listing && listing.neighbourhoodDescription && (
                  <p className="text-gray-600 ml-6 mt-2 leading-relaxed">{listing.neighbourhoodDescription as string}</p>
                )}
              </div>
              {/* Map placeholder */}
              <div className="mt-4 h-40 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                <div className="text-center text-gray-400">
                  <MapPin className="w-8 h-8 mx-auto mb-1" />
                  <p className="text-sm font-medium">Map coming soon</p>
                </div>
              </div>
            </div>

            {/* Similar listings */}
            {similarListings.length > 0 && (
              <div>
                <h2 className="font-bold text-gray-900 mb-4">Similar Properties</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {similarListings.map((l) => (
                    <ListingCard key={l.id} listing={l} isAuthenticated={!!session} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column — sticky sidebar */}
          <div className="mt-6 lg:mt-0">
            <div className="lg:sticky lg:top-6 space-y-4">
              {/* Price card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {formatNaira(listing.annualRent)}
                </div>
                <p className="text-sm text-gray-500 mb-4">per annum</p>

                <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                  {listing.cautionDeposit && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Caution deposit</span>
                      <span className="font-medium">{formatNaira(listing.cautionDeposit as number)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">SafeRent fee (5%)</span>
                    <span className="font-medium">{formatNaira(saferentFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Document fee</span>
                    <span className="font-medium">{formatNaira(documentFee)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-100 text-base font-bold text-gray-900">
                    <span>Total at checkout</span>
                    <span>{formatNaira(totalAtCheckout)}</span>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <a
                    href={`/listings/${id}/pay`}
                    className="block w-full py-3 bg-[#0F7B5A] text-white text-center font-semibold rounded-xl hover:bg-[#0a6049] transition-colors"
                  >
                    Pay with SafeRent Escrow
                  </a>
                </div>

                {/* Enquiry + viewing buttons */}
                <ListingDetailClient
                  listingId={id}
                  listingTitle={listing.title}
                  isAuthenticated={!!session}
                  showViewingButton={true}
                />
              </div>

              {/* Owner card */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Listed by</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{ownerName}</p>
                    {memberSince && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <CalendarDays className="w-3 h-3" />
                        Member since {memberSince}
                      </p>
                    )}
                  </div>
                </div>
                {badgeTier !== "NONE" && (
                  <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${BADGE_TIER_STYLES[badgeTier]}`}>
                    {badgeTier === "CERTIFIED" ? "★ SafeRent Certified" : badgeTier === "PROPERTY_VERIFIED" ? "✓ Property Verified" : "ID Verified"}
                  </span>
                )}
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  Response rate: —
                </div>
              </div>

              {/* Share & report */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Share this listing</h3>
                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Check out this property on SafeRent: ${listing.title} — ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500 text-white text-xs font-semibold rounded-xl hover:bg-green-600 transition-colors"
                  >
                    WhatsApp
                  </a>
                  <ListingDetailClient
                    listingId={id}
                    listingTitle={listing.title}
                    isAuthenticated={!!session}
                    showCopyOnly
                  />
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button className="text-xs text-red-400 hover:text-red-500 transition-colors">
                    Report this listing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
