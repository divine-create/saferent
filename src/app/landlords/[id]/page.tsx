import Link from "next/link";
import { Shield, Star, CheckCircle, MapPin, Calendar, ArrowLeft } from "lucide-react";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { mockListings } from "@/lib/mock-listings";
import { formatNaira } from "@/lib/utils";

const BADGE_TIER_LABELS: Record<string, string> = {
  CERTIFIED: "SafeRent Certified Gold",
  PROPERTY_VERIFIED: "Property Verified",
  ID_VERIFIED: "ID Verified",
  NONE: "Unverified",
};

const BADGE_TIER_COLORS: Record<string, string> = {
  CERTIFIED: "bg-[#D4A017] text-white",
  PROPERTY_VERIFIED: "bg-[#0F7B5A] text-white",
  ID_VERIFIED: "bg-blue-600 text-white",
  NONE: "bg-gray-200 text-gray-600",
};

const MOCK_LANDLORDS: Record<string, {
  id: string;
  firstName: string;
  lastName: string;
  badgeTier: string;
  memberSince: string;
  completedLets: number;
  rating: number;
  reviewCount: number;
  initials: string;
}> = {
  landlord1: {
    id: "landlord1",
    firstName: "Olumide",
    lastName: "Fadare",
    badgeTier: "CERTIFIED",
    memberSince: "January 2024",
    completedLets: 7,
    rating: 4.9,
    reviewCount: 6,
    initials: "OF",
  },
  landlord2: {
    id: "landlord2",
    firstName: "Amaka",
    lastName: "Okonkwo",
    badgeTier: "PROPERTY_VERIFIED",
    memberSince: "March 2025",
    completedLets: 3,
    rating: 4.6,
    reviewCount: 3,
    initials: "AO",
  },
};

const MOCK_REVIEWS = [
  {
    id: "r1",
    reviewerId: "u1",
    revieweeId: "landlord1",
    type: "tenant_to_landlord",
    overallRating: 5,
    conditionRating: 5,
    responsivenessRating: 5,
    comment: "The property was exactly as described and in perfect condition. Olumide was extremely responsive throughout the process.",
    reviewer: { firstName: "Tunde", lastName: "Adeyemi", profilePhoto: null },
    createdAt: "2026-03-10",
    isPublished: true,
    isFlagged: false,
  },
  {
    id: "r2",
    reviewerId: "u2",
    revieweeId: "landlord1",
    type: "tenant_to_landlord",
    overallRating: 5,
    comment: "Very professional landlord. Quick to resolve maintenance issues. Would recommend.",
    reviewer: { firstName: "Chioma", lastName: "Nwosu", profilePhoto: null },
    createdAt: "2026-01-05",
    isPublished: true,
    isFlagged: false,
  },
];

type Props = {
  params: Promise<{ id: string }>;
};

export default async function LandlordProfilePage({ params }: Props) {
  const { id } = await params;
  const landlord = MOCK_LANDLORDS[id] ?? MOCK_LANDLORDS["landlord1"];
  const landlordListings = mockListings.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0F7B5A] rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SafeRent</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-[#0F7B5A]">Sign In</Link>
            <Link href="/register" className="bg-[#0F7B5A] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#0a6049]">Get Started</Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/listings" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0F7B5A] mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Listings
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <div className="w-20 h-20 bg-[#0F7B5A]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-[#0F7B5A] font-bold text-2xl">{landlord.initials}</span>
              </div>

              <div className="text-center mb-5">
                <h1 className="text-xl font-bold text-gray-900 mb-2">
                  {landlord.firstName} {landlord.lastName}
                </h1>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${BADGE_TIER_COLORS[landlord.badgeTier]}`}>
                  {landlord.badgeTier === "CERTIFIED" && <Star className="w-3 h-3 fill-current" />}
                  {landlord.badgeTier !== "CERTIFIED" && <CheckCircle className="w-3 h-3" />}
                  {BADGE_TIER_LABELS[landlord.badgeTier]}
                </span>
              </div>

              <div className="flex items-center gap-1.5 justify-center mb-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(landlord.rating) ? "fill-[#D4A017] text-[#D4A017]" : "text-gray-300"}`} />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">{landlord.rating}</span>
                <span className="text-xs text-gray-400">({landlord.reviewCount})</span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="flex items-center gap-2 text-gray-500">
                    <Calendar className="w-4 h-4" /> Member since
                  </span>
                  <span className="font-medium text-gray-700">{landlord.memberSince}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="flex items-center gap-2 text-gray-500">
                    <CheckCircle className="w-4 h-4" /> Completed lets
                  </span>
                  <span className="font-medium text-gray-700">{landlord.completedLets}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active listings */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4">Active Listings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {landlordListings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/listings/${listing.id}`}
                    className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-all group"
                  >
                    <div className="h-28 bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center">
                      <svg className="w-8 h-8 text-[#0F7B5A]/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <rect x="2" y="3" width="20" height="18" rx="2" />
                        <path d="M8 3v18M16 3v18M2 9h20M2 15h20" />
                      </svg>
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold text-gray-800 line-clamp-1 group-hover:text-[#0F7B5A]">{listing.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />{listing.area}
                      </p>
                      <p className="text-sm font-bold text-gray-900 mt-1">{formatNaira(listing.annualRent)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Reviews from Tenants</h2>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-[#D4A017] text-[#D4A017]" />
                  <span className="font-semibold text-gray-700">{landlord.rating}</span>
                </div>
              </div>
              <div className="space-y-4">
                {MOCK_REVIEWS.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
