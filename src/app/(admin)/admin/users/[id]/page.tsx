import { requireAdmin } from "@/lib/admin-auth";
import { mockAdminUsers } from "@/lib/mock-admin";
import { Badge } from "@/components/ui/Badge";
import { formatKoboToNaira } from "@/lib/utils";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Shield,
  Mail,
  Phone,
  FileText,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

function VerifRow({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  const map: Record<string, { icon: React.ReactNode; cls: string }> = {
    VERIFIED: { icon: <CheckCircle2 className="w-4 h-4 text-green-600" />, cls: "text-green-700" },
    PENDING: { icon: <Shield className="w-4 h-4 text-yellow-600" />, cls: "text-yellow-700" },
    FAILED: { icon: <XCircle className="w-4 h-4 text-red-600" />, cls: "text-red-700" },
    NOT_SUBMITTED: { icon: <XCircle className="w-4 h-4 text-gray-400" />, cls: "text-gray-400" },
  };
  const s = map[status] ?? map.NOT_SUBMITTED;
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-1.5">
        {s.icon}
        <span className={`text-sm font-medium ${s.cls}`}>{status.replace("_", " ")}</span>
      </div>
    </div>
  );
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const user = mockAdminUsers.find((u) => u.id === id) ?? mockAdminUsers[0];

  const statusLabel = user.isBanned ? "BANNED" : !user.isActive ? "SUSPENDED" : "ACTIVE";
  const statusColor = user.isBanned
    ? "bg-red-900 text-white"
    : !user.isActive
    ? "bg-orange-100 text-orange-800"
    : "bg-green-100 text-green-800";

  const roleColors: Record<string, string> = {
    TENANT: "bg-blue-100 text-blue-800",
    LANDLORD: "bg-purple-100 text-purple-800",
    AGENT: "bg-amber-100 text-amber-800",
  };

  const scoreComponents = [
    { label: "Email verified", points: user.isEmailVerified ? 10 : 0, max: 10 },
    { label: "Phone verified", points: user.isPhoneVerified ? 15 : 0, max: 15 },
    { label: "BVN verified", points: user.bvnVerificationStatus === "VERIFIED" ? 40 : 0, max: 40 },
    { label: "ID document", points: user.idDocumentStatus === "VERIFIED" ? 25 : 0, max: 25 },
    { label: "Bank statement", points: 0, max: 10 },
  ];

  // Mock transaction history
  const mockTransactions = [
    { id: "txn_1", reference: "SR-2024-ABC12", property: "3 Bedroom Flat, Lekki", amount: BigInt(387500000), status: "FUNDED", date: new Date("2024-11-20") },
    { id: "txn_2", reference: "SR-2024-DEF34", property: "2 Bedroom Flat, Surulere", amount: BigInt(212000000), status: "RELEASED", date: new Date("2024-10-05") },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back */}
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </Link>

      {/* Profile header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-gray-600">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleColors[user.role] ?? "bg-gray-100 text-gray-700"}`}>
                  {user.role}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}>
                  {statusLabel}
                </span>
                <span className="text-xs text-gray-400">
                  Joined {new Date(user.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{user.email}</span>
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{user.phone}</span>
              </div>
            </div>
          </div>
          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {!user.isBanned && user.isActive && (
              <form action={`/api/admin/users/${user.id}/action`} method="POST">
                <input type="hidden" name="action" value="suspend" />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-lg border border-orange-200 text-orange-700 text-sm font-medium hover:bg-orange-50 transition-colors"
                >
                  Suspend
                </button>
              </form>
            )}
            {!user.isActive && !user.isBanned && (
              <form action={`/api/admin/users/${user.id}/action`} method="POST">
                <input type="hidden" name="action" value="unsuspend" />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-lg border border-green-200 text-green-700 text-sm font-medium hover:bg-green-50 transition-colors"
                >
                  Unsuspend
                </button>
              </form>
            )}
            {!user.isBanned && (
              <form action={`/api/admin/users/${user.id}/action`} method="POST">
                <input type="hidden" name="action" value="ban" />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-lg border border-red-200 text-red-700 text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  Ban User
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Verification status */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">Verification Status</h2>
            <VerifRow label="BVN" status={user.bvnVerificationStatus} />
            <VerifRow label="NIN" status={user.ninVerificationStatus} />
            <VerifRow label="ID Document" status={user.idDocumentStatus} />
            <VerifRow label="Email" status={user.isEmailVerified ? "VERIFIED" : "NOT_SUBMITTED"} />
            <VerifRow label="Phone" status={user.isPhoneVerified ? "VERIFIED" : "NOT_SUBMITTED"} />
            <div className="flex gap-2 mt-4">
              <button className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors">
                Approve Documents
              </button>
              <button className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors">
                Reject Documents
              </button>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">Documents</h2>
            <div className="grid grid-cols-2 gap-3">
              {["Government ID", "Bank Statement", "Proof of Address"].map((doc) => (
                <div key={doc} className="border border-dashed border-gray-200 rounded-lg p-4 text-center">
                  <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 font-medium">{doc}</p>
                  <p className="text-xs text-gray-400 mt-1">Not uploaded</p>
                  <div className="flex gap-1 justify-center mt-2">
                    <button className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200 transition-colors">Approve</button>
                    <button className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 transition-colors">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction history */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">Transaction History</h2>
            {mockTransactions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No transactions</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left pb-2 text-gray-500 font-medium">Reference</th>
                      <th className="text-left pb-2 text-gray-500 font-medium">Property</th>
                      <th className="text-left pb-2 text-gray-500 font-medium">Amount</th>
                      <th className="text-left pb-2 text-gray-500 font-medium">Status</th>
                      <th className="text-left pb-2 text-gray-500 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockTransactions.map((t) => (
                      <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 font-mono text-xs text-gray-600">{t.reference}</td>
                        <td className="py-2 text-gray-700">{t.property}</td>
                        <td className="py-2 text-gray-900 font-medium">{formatKoboToNaira(t.amount)}</td>
                        <td className="py-2">
                          <Badge variant={t.status === "FUNDED" ? "warning" : "success"}>{t.status}</Badge>
                        </td>
                        <td className="py-2 text-gray-400 text-xs">
                          {t.date.toLocaleDateString("en-NG")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Trust score */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-1">Trust Score</h2>
            <p className="text-3xl font-bold text-[#0F7B5A] mb-4">{user.trustScore}</p>
            <div className="space-y-2">
              {scoreComponents.map((c) => (
                <div key={c.label}>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{c.label}</span>
                    <span>{c.points}/{c.max}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${c.points > 0 ? "bg-[#0F7B5A]" : "bg-gray-200"}`}
                      style={{ width: `${(c.points / c.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">Quick Info</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Onboarding</span>
                <span className={user.onboardingComplete ? "text-green-600" : "text-gray-400"}>
                  {user.onboardingComplete ? "Complete" : "Incomplete"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last updated</span>
                <span className="text-gray-700">{new Date(user.updatedAt).toLocaleDateString("en-NG")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">User ID</span>
                <span className="font-mono text-xs text-gray-500">{user.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
