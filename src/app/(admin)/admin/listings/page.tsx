import { requireAdmin } from "@/lib/admin-auth";
import { mockPendingListings } from "@/lib/mock-admin";
import { Badge } from "@/components/ui/Badge";
import { formatKoboToNaira } from "@/lib/utils";
import Link from "next/link";
import { Download, Building2 } from "lucide-react";

const TABS = ["queue", "flagged", "all"] as const;
type Tab = (typeof TABS)[number];

interface PageProps {
  searchParams: Promise<{ tab?: string; search?: string; page?: string }>;
}

function PropertyTypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
      {type.replace("_", " ")}
    </span>
  );
}

const mockFlaggedListings = [
  {
    id: "lst_fl_001",
    title: "Luxury 5 Bed in Banana Island",
    address: "Plot 23, Banana Island, Lagos",
    owner: { firstName: "John", lastName: "Doe", role: "LANDLORD" },
    status: "UNVERIFIED_ACTIVE",
    photos: [] as { url: string }[],
    annualRent: BigInt(2000000000),
    propertyType: "DETACHED_HOUSE",
    createdAt: new Date("2024-12-10"),
    viewCount: 45,
    enquiryCount: 12,
    flagReason: "Price anomaly — far above market rate",
  },
  {
    id: "lst_fl_002",
    title: "Studio near Oshodi",
    address: "4 Ikorodu Road, Oshodi, Lagos",
    owner: { firstName: "James", lastName: "Obi", role: "AGENT" },
    status: "UNVERIFIED_ACTIVE",
    photos: [] as { url: string }[],
    annualRent: BigInt(60000000),
    propertyType: "STUDIO",
    createdAt: new Date("2024-12-05"),
    viewCount: 120,
    enquiryCount: 30,
    flagReason: "Reported by 3 users as fraudulent",
  },
];

export default async function AdminListingsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const sp = await searchParams;
  const tab = (sp.tab ?? "queue") as Tab;

  const listings = tab === "flagged" ? mockFlaggedListings : tab === "queue" ? mockPendingListings : [...mockPendingListings, ...mockFlaggedListings];

  function tabHref(t: string) {
    return `/admin/listings?tab=${t}`;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Listings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Moderation and verification</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {[
          { key: "queue", label: "Verification Queue", count: mockPendingListings.length },
          { key: "flagged", label: "Flagged", count: mockFlaggedListings.length },
          { key: "all", label: "All Listings", count: null },
        ].map((t) => (
          <Link
            key={t.key}
            href={tabHref(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? "border-[#0F7B5A] text-[#0F7B5A]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            {t.label}
            {t.count !== null && (
              <span className={`ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs ${tab === t.key ? "bg-[#0F7B5A] text-white" : "bg-gray-100 text-gray-600"}`}>
                {t.count}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {listings.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No listings in this queue</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Property</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Owner</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Rent/yr</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Submitted</th>
                  {tab === "flagged" && <th className="text-left px-4 py-3 font-medium text-gray-600">Flag reason</th>}
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <tr key={listing.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-48">{listing.title}</p>
                          <p className="text-xs text-gray-400 truncate max-w-48">{listing.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{listing.owner.firstName} {listing.owner.lastName}</p>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        {listing.owner.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <PropertyTypeBadge type={listing.propertyType} />
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {formatKoboToNaira(typeof listing.annualRent === "number" ? BigInt(listing.annualRent) : listing.annualRent)}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(listing.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    {tab === "flagged" && (
                      <td className="px-4 py-3 text-xs text-red-600 max-w-48">
                        {"flagReason" in listing ? listing.flagReason : ""}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/listings/${listing.id}`}
                          className="px-2.5 py-1 rounded border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          Review
                        </Link>
                        {tab === "queue" && (
                          <>
                            <button className="px-2.5 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-700 transition-colors">
                              Approve
                            </button>
                            <button className="px-2.5 py-1 rounded bg-red-100 text-red-700 text-xs hover:bg-red-200 transition-colors">
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
