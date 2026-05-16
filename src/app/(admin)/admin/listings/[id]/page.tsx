import { requireAdmin } from "@/lib/admin-auth";
import { mockPendingListings } from "@/lib/mock-admin";
import { formatKoboToNaira } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { ArrowLeft, FileText, Building2, MapPin, BedDouble, Bath } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminListingDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const listing = mockPendingListings.find((l) => l.id === id) ?? mockPendingListings[0];
  const annualRentBigInt = typeof listing.annualRent === "number" ? BigInt(listing.annualRent) : listing.annualRent as bigint;

  // Mock area median (within 20% of listed price)
  const areaMedian = (Number(annualRentBigInt) * 0.85).toFixed(0);
  const priceDiff = ((Number(annualRentBigInt) - Number(areaMedian)) / Number(areaMedian) * 100).toFixed(0);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back */}
      <Link href="/admin/listings" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Listings
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="pending">PENDING VERIFICATION</Badge>
              <span className="text-xs text-gray-400">ID: {listing.id}</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{listing.title}</h1>
            <p className="flex items-center gap-1 text-gray-500 text-sm mt-1">
              <MapPin className="w-3.5 h-3.5" />
              {listing.address}, {listing.lga}, {listing.state}
            </p>
          </div>
          {/* Action bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors">
              Approve Verified
            </button>
            <button className="px-3 py-2 rounded-lg border border-green-300 text-green-700 text-sm font-medium hover:bg-green-50 transition-colors">
              Approve Unverified
            </button>
            <button className="px-3 py-2 rounded-lg border border-yellow-300 text-yellow-700 text-sm font-medium hover:bg-yellow-50 transition-colors">
              Request More Docs
            </button>
            <button className="px-3 py-2 rounded-lg border border-red-300 text-red-700 text-sm font-medium hover:bg-red-50 transition-colors">
              Reject
            </button>
            <button className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main listing info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo placeholder */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">Photos</h2>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-gray-300" />
                </div>
              ))}
            </div>
          </div>

          {/* Listing details */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">Property Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Type</p>
                <p className="font-medium text-gray-900">{listing.propertyType.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-gray-500">Bedrooms</p>
                <p className="font-medium text-gray-900 flex items-center gap-1">
                  <BedDouble className="w-3.5 h-3.5" />{listing.bedrooms}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Bathrooms</p>
                <p className="font-medium text-gray-900 flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5" />{listing.bathrooms}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Annual rent</p>
                <p className="font-medium text-gray-900">{formatKoboToNaira(annualRentBigInt)}</p>
              </div>
              <div>
                <p className="text-gray-500">State</p>
                <p className="font-medium text-gray-900">{listing.state}</p>
              </div>
              <div>
                <p className="text-gray-500">Area</p>
                <p className="font-medium text-gray-900">{listing.area}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">Submitted Documents</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Title Document", url: listing.titleDocumentUrl },
                { label: "Survey Plan", url: listing.surveyPlanUrl },
              ].map((doc) => (
                <div key={doc.label} className="border border-dashed border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-6 h-6 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{doc.label}</span>
                  </div>
                  {doc.url ? (
                    <p className="text-xs text-green-600 mb-2">Document uploaded</p>
                  ) : (
                    <p className="text-xs text-gray-400 mb-2">Not submitted</p>
                  )}
                  <div className="flex gap-2">
                    <button className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200 transition-colors">
                      Approve
                    </button>
                    <button className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 transition-colors">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price benchmarking */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">Price Benchmarking</h2>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <p className="text-gray-500">Listed price</p>
                <p className="font-bold text-gray-900 text-lg">{formatKoboToNaira(annualRentBigInt)}</p>
              </div>
              <div className="text-gray-300">vs</div>
              <div>
                <p className="text-gray-500">Area median ({listing.area})</p>
                <p className="font-bold text-gray-600 text-lg">{formatKoboToNaira(BigInt(areaMedian))}</p>
              </div>
              <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${Number(priceDiff) > 20 ? "bg-red-100 text-red-700" : Number(priceDiff) > 0 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                {Number(priceDiff) > 0 ? "+" : ""}{priceDiff}% vs median
              </div>
            </div>
          </div>
        </div>

        {/* Right: Owner info */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">Owner</h2>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-gray-600">
                  {listing.owner.firstName.charAt(0)}{listing.owner.lastName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{listing.owner.firstName} {listing.owner.lastName}</p>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  {listing.owner.role}
                </span>
              </div>
            </div>
            <Link
              href={`/admin/users/${listing.owner.id ?? "usr_002"}`}
              className="text-xs text-[#0F7B5A] hover:underline"
            >
              View owner profile →
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-2">Submission Info</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Submitted</span>
                <span className="text-gray-700">{new Date(listing.createdAt).toLocaleDateString("en-NG")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Views</span>
                <span className="text-gray-700">{listing.viewCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Enquiries</span>
                <span className="text-gray-700">{listing.enquiryCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
