import Link from "next/link";
import { Shield, Star, CheckCircle, MapPin, Clock, ArrowLeft, MessageCircle } from "lucide-react";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { mockListings } from "@/lib/mock-listings";
import { formatNaira } from "@/lib/utils";

const MOCK_AGENTS: Record<string, {
  id: string;
  firstName: string;
  lastName: string;
  businessName: string;
  bio: string;
  areas: string[];
  propertyTypes: string[];
  listings: number;
  completedLets: number;
  responseRate: number;
  avgDaysToLet: number;
  isPro: boolean;
  cacVerified: boolean;
  lasreraVerified: boolean;
  initials: string;
  rating: number;
  reviewCount: number;
}> = {
  agent1: {
    id: "agent1",
    firstName: "Babatunde",
    lastName: "Adeyemi",
    businessName: "Adeyemi Properties",
    bio: "Lagos-based property agent specialising in Lekki, Ikeja, and Victoria Island. LASRERA certified. 8 years of experience helping tenants and landlords across Lagos. I pride myself on honest communication, prompt responses, and ensuring every deal closes smoothly for both sides.",
    areas: ["Lekki", "Ikeja", "Victoria Island", "Ikoyi"],
    propertyTypes: ["Flat", "Duplex", "Terraced House"],
    listings: 24,
    completedLets: 31,
    responseRate: 95,
    avgDaysToLet: 11,
    isPro: true,
    cacVerified: true,
    lasreraVerified: true,
    initials: "BA",
    rating: 4.8,
    reviewCount: 18,
  },
  agent2: {
    id: "agent2",
    firstName: "Ngozi",
    lastName: "Okafor",
    businessName: "Okafor Realty",
    bio: "Abuja-based agent covering Maitama, Wuse, and Garki. Specialist in executive apartments and corporate lets.",
    areas: ["Maitama", "Wuse 2", "Garki"],
    propertyTypes: ["Flat", "Terraced House"],
    listings: 15,
    completedLets: 19,
    responseRate: 88,
    avgDaysToLet: 15,
    isPro: false,
    cacVerified: true,
    lasreraVerified: false,
    initials: "NO",
    rating: 4.5,
    reviewCount: 11,
  },
};

const MOCK_REVIEWS = [
  {
    id: "r1",
    reviewerId: "u1",
    revieweeId: "agent1",
    type: "tenant_to_agent",
    overallRating: 5,
    comment: "Babatunde was incredibly professional. He responded to every question within the hour and made sure the entire process was stress-free.",
    reviewer: { firstName: "Adaeze", lastName: "Obi", profilePhoto: null },
    createdAt: "2026-02-14",
    isPublished: true,
    isFlagged: false,
  },
  {
    id: "r2",
    reviewerId: "u2",
    revieweeId: "agent1",
    type: "landlord_to_agent",
    overallRating: 5,
    comment: "He found me a qualified tenant in under 2 weeks. His tenant screening was thorough. I highly recommend.",
    reviewer: { firstName: "Olumide", lastName: "Fadare", profilePhoto: null },
    createdAt: "2026-01-20",
    isPublished: true,
    isFlagged: false,
  },
];

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AgentProfilePage({ params }: Props) {
  const { id } = await params;
  const agent = MOCK_AGENTS[id] ?? MOCK_AGENTS["agent1"];
  const agentListings = mockListings.slice(0, 3);

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

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back */}
        <Link href="/agents" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0F7B5A] mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Agent Directory
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              {/* Avatar */}
              <div className="w-20 h-20 bg-[#0F7B5A]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-[#0F7B5A] font-bold text-2xl">{agent.initials}</span>
              </div>

              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-gray-900">{agent.firstName} {agent.lastName}</h1>
                  {agent.isPro && (
                    <span className="flex items-center gap-0.5 text-xs bg-[#D4A017] text-white font-semibold px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3 fill-white" /> Pro
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{agent.businessName}</p>

                {/* Star rating */}
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(agent.rating) ? "fill-[#D4A017] text-[#D4A017]" : "text-gray-300"}`} />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{agent.rating}</span>
                  <span className="text-xs text-gray-400">({agent.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Verification badges */}
              <div className="flex justify-center gap-2 mb-4">
                {agent.cacVerified && (
                  <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 font-medium px-2.5 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" /> CAC Verified
                  </span>
                )}
                {agent.lasreraVerified && (
                  <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 font-medium px-2.5 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" /> LASRERA
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {[
                  { val: agent.listings, label: "Active listings" },
                  { val: agent.completedLets, label: "Completed lets" },
                  { val: `${agent.responseRate}%`, label: "Response rate" },
                  { val: `${agent.avgDaysToLet}d`, label: "Avg to let" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-base font-bold text-gray-900">{stat.val}</p>
                    <p className="text-xs text-gray-400">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Areas */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Areas
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {agent.areas.map((area) => (
                    <span key={area} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{area}</span>
                  ))}
                </div>
              </div>

              {/* Property types */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Specialises in</p>
                <div className="flex flex-wrap gap-1.5">
                  {agent.propertyTypes.map((t) => (
                    <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <Link
                href={`/messages`}
                className="flex items-center justify-center gap-2 w-full bg-[#0F7B5A] text-white font-semibold py-3 rounded-xl hover:bg-[#0a6049] transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Contact Agent
              </Link>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-3">About</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{agent.bio}</p>
            </div>

            {/* Active listings */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4">Active Listings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {agentListings.map((listing) => (
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
                <h2 className="font-bold text-gray-900">Reviews</h2>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-[#D4A017] text-[#D4A017]" />
                  <span className="font-semibold text-gray-700">{agent.rating}</span>
                  <span className="text-gray-400 text-sm">({agent.reviewCount})</span>
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
