import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  Plus, Eye, MessageSquare, Building2,
  PauseCircle, PlayCircle, Pencil, Trash2, Copy
} from "lucide-react";
import { formatNaira } from "@/lib/utils";

const STATUS_STYLES: Record<string, { label: string; class: string }> = {
  DRAFT: { label: "Draft", class: "bg-gray-100 text-gray-600" },
  PENDING_VERIFICATION: { label: "Pending Verification", class: "bg-yellow-100 text-yellow-700" },
  VERIFIED_ACTIVE: { label: "Verified & Active", class: "bg-green-100 text-[#0F7B5A]" },
  UNVERIFIED_ACTIVE: { label: "Active (Unverified)", class: "bg-blue-100 text-blue-700" },
  PAUSED: { label: "Paused", class: "bg-orange-100 text-orange-700" },
  LET_AGREED: { label: "Let Agreed", class: "bg-purple-100 text-purple-700" },
  OCCUPIED: { label: "Occupied", class: "bg-indigo-100 text-indigo-700" },
  EXPIRED: { label: "Expired", class: "bg-red-100 text-red-600" },
};

export default async function LandlordListingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "LANDLORD" && session.user.role !== "AGENT") redirect("/login");

  let listings: {
    id: string;
    title: string;
    propertyType: string;
    bedrooms: number;
    area: string;
    lga: string;
    state: string;
    annualRent: bigint;
    status: string;
    isVerified: boolean;
    viewCount: number;
    enquiryCount: number;
    createdAt: Date;
    photos: { url: string }[];
  }[] = [];

  try {
    listings = await db.listing.findMany({
      where: { ownerId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        propertyType: true,
        bedrooms: true,
        area: true,
        lga: true,
        state: true,
        annualRent: true,
        status: true,
        isVerified: true,
        viewCount: true,
        enquiryCount: true,
        createdAt: true,
        photos: { orderBy: { order: "asc" }, take: 1, select: { url: true } },
      },
    });
  } catch {
    // DB not available, show empty state
  }

  const totalViews = listings.reduce((sum, l) => sum + l.viewCount, 0);
  const totalEnquiries = listings.reduce((sum, l) => sum + l.enquiryCount, 0);
  const activeCount = listings.filter((l) => l.status === "VERIFIED_ACTIVE" || l.status === "UNVERIFIED_ACTIVE").length;

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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage all your rental properties</p>
        </div>
        <Link
          href="/landlord/listings/new"
          className="inline-flex items-center gap-2 bg-[#0F7B5A] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#0a6049] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Listing
        </Link>
      </div>

      {/* Stats row */}
      {listings.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-gray-900">{listings.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">Total Listings</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
            <div className="text-xs text-gray-500 mt-0.5">Active</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-gray-900">{totalEnquiries}</div>
            <div className="text-xs text-gray-500 mt-0.5">Total Enquiries</div>
          </div>
        </div>
      )}

      {/* Listings list */}
      {listings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-gray-300" />
          </div>
          <h2 className="font-semibold text-gray-700 text-lg mb-2">No listings yet</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
            Create your first listing to start receiving verified tenant applications and enquiries.
          </p>
          <Link
            href="/landlord/listings/new"
            className="inline-flex items-center gap-2 bg-[#0F7B5A] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#0a6049] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => {
            const statusInfo = STATUS_STYLES[listing.status] ?? STATUS_STYLES.DRAFT;
            const isActive = listing.status === "VERIFIED_ACTIVE" || listing.status === "UNVERIFIED_ACTIVE";

            return (
              <div
                key={listing.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                    {listing.photos[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={listing.photos[0].url} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{listing.title}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusInfo.class}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {PROPERTY_TYPE_LABELS[listing.propertyType] ?? listing.propertyType} · {listing.bedrooms} bed · {listing.area}, {listing.lga}
                    </p>
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      {formatNaira(Number(listing.annualRent))} <span className="font-normal text-gray-500 text-xs">p.a.</span>
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-6 shrink-0">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <Eye className="w-3.5 h-3.5" />
                        <span className="font-semibold text-gray-900">{listing.viewCount}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Views</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="font-semibold text-gray-900">{listing.enquiryCount}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Enquiries</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                      title="View listing"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/landlord/listings/${listing.id}/edit`}
                      className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                      title="Edit listing"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                      title={isActive ? "Pause listing" : "Activate listing"}
                    >
                      {isActive ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                    </button>
                    <button
                      className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                      title="Duplicate listing"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors"
                      title="Delete listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Verification prompt */}
                {!listing.isVerified && (listing.status === "UNVERIFIED_ACTIVE") && (
                  <div className="px-4 py-2.5 bg-yellow-50 border-t border-yellow-100 flex items-center justify-between">
                    <p className="text-xs text-yellow-700">
                      ⚡ Get this listing verified to receive 3× more enquiries
                    </p>
                    <Link href="/onboarding" className="text-xs font-semibold text-yellow-700 hover:underline shrink-0 ml-2">
                      Verify Now →
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary footer */}
      {listings.length > 0 && (
        <div className="text-center text-xs text-gray-400 pt-2">
          Total views across all listings: <span className="font-semibold">{totalViews.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
