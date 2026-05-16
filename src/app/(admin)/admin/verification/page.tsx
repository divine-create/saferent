import { requireAdmin } from "@/lib/admin-auth";
import { mockAdminUsers, mockPendingListings } from "@/lib/mock-admin";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { ShieldCheck, Building2 } from "lucide-react";

// Mock BVN match results
const BVN_MATCH: Record<string, string> = {
  usr_003: "Partial",
  usr_006: "Match",
};

export default async function AdminVerificationPage() {
  await requireAdmin();

  const identityQueue = mockAdminUsers.filter(
    (u) => (u.bvnVerificationStatus as string) === "PENDING" || (u.idDocumentStatus as string) === "PENDING"
  );
  const propertyQueue = mockPendingListings;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Verification Queue</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {identityQueue.length} identity · {propertyQueue.length} property verifications pending
        </p>
      </div>

      {/* Identity verification */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-[#0F7B5A]" />
          <h2 className="text-lg font-semibold text-gray-900">Identity Verification</h2>
          <span className="ml-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold">
            {identityQueue.length}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {identityQueue.length === 0 ? (
            <div className="text-center py-12 text-gray-400">All identity verifications up to date</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Doc type</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Submitted</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">BVN match</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {identityQueue.map((user) => {
                    const bvnMatch = BVN_MATCH[user.id] ?? "No match";
                    const matchColor =
                      bvnMatch === "Match"
                        ? "text-green-600 bg-green-50"
                        : bvnMatch === "Partial"
                        ? "text-yellow-700 bg-yellow-50"
                        : "text-red-600 bg-red-50";
                    return (
                      <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-600">
                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <Link href={`/admin/users/${user.id}`} className="font-medium text-gray-900 hover:text-[#0F7B5A]">
                                {user.firstName} {user.lastName}
                              </Link>
                              <p className="text-xs text-gray-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {user.idDocumentStatus === "PENDING" ? "National ID" : "BVN re-check"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${matchColor}`}>
                            {bvnMatch}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="px-2.5 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-700 transition-colors">
                              Approve
                            </button>
                            <button className="px-2.5 py-1 rounded bg-red-100 text-red-700 text-xs hover:bg-red-200 transition-colors">
                              Reject
                            </button>
                            <button className="px-2.5 py-1 rounded border border-gray-200 text-gray-600 text-xs hover:bg-gray-50 transition-colors">
                              Flag
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Property verification */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-[#0F7B5A]" />
          <h2 className="text-lg font-semibold text-gray-900">Property Verification</h2>
          <span className="ml-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold">
            {propertyQueue.length}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {propertyQueue.length === 0 ? (
            <div className="text-center py-12 text-gray-400">All property verifications up to date</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Property</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Owner</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Doc type</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Submitted</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {propertyQueue.map((listing) => (
                    <tr key={listing.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/admin/listings/${listing.id}`} className="font-medium text-gray-900 hover:text-[#0F7B5A] truncate block max-w-56">
                          {listing.title}
                        </Link>
                        <p className="text-xs text-gray-400 truncate max-w-56">{listing.address}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-700">{listing.owner.firstName} {listing.owner.lastName}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {listing.titleDocumentUrl ? "Certificate of Occupancy" : "No doc uploaded"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(listing.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="px-2.5 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-700 transition-colors">
                            Approve
                          </button>
                          <button className="px-2.5 py-1 rounded bg-red-100 text-red-700 text-xs hover:bg-red-200 transition-colors">
                            Reject
                          </button>
                          <button className="px-2.5 py-1 rounded border border-gray-200 text-gray-600 text-xs hover:bg-gray-50 transition-colors">
                            Request More
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
