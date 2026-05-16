import { requireAdmin } from "@/lib/admin-auth";
import { mockAdminUsers } from "@/lib/mock-admin";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Search, Download } from "lucide-react";

const ROLES = ["ALL", "TENANT", "LANDLORD", "AGENT"] as const;
const STATUSES = ["ALL", "ACTIVE", "SUSPENDED", "BANNED"] as const;

function StatusBadge({ user }: { user: { isActive: boolean; isBanned: boolean } }) {
  if (user.isBanned) return <Badge variant="error">BANNED</Badge>;
  if (!user.isActive) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">SUSPENDED</span>;
  return <Badge variant="success">ACTIVE</Badge>;
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    TENANT: "bg-blue-100 text-blue-800",
    LANDLORD: "bg-purple-100 text-purple-800",
    AGENT: "bg-amber-100 text-amber-800",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[role] ?? "bg-gray-100 text-gray-700"}`}>
      {role}
    </span>
  );
}

function BvnBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    VERIFIED: { label: "Verified", cls: "text-green-700" },
    PENDING: { label: "Pending", cls: "text-yellow-700" },
    FAILED: { label: "Failed", cls: "text-red-700" },
    NOT_SUBMITTED: { label: "N/A", cls: "text-gray-400" },
  };
  const s = map[status] ?? { label: status, cls: "text-gray-500" };
  return <span className={`text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

function TrustBar({ score }: { score: number }) {
  const color = score >= 70 ? "bg-green-500" : score >= 40 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-gray-600">{score}</span>
    </div>
  );
}

interface PageProps {
  searchParams: Promise<{ search?: string; role?: string; status?: string; page?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  await requireAdmin();
  const sp = await searchParams;
  const search = sp.search ?? "";
  const roleFilter = sp.role ?? "ALL";
  const statusFilter = sp.status ?? "ALL";
  const page = parseInt(sp.page ?? "1");
  const limit = 25;

  // Filter mock data
  let filtered = mockAdminUsers;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(search)
    );
  }
  if (roleFilter !== "ALL") {
    filtered = filtered.filter((u) => u.role === roleFilter);
  }
  if (statusFilter === "ACTIVE") {
    filtered = filtered.filter((u) => u.isActive && !u.isBanned);
  } else if (statusFilter === "SUSPENDED") {
    filtered = filtered.filter((u) => !u.isActive && !u.isBanned);
  } else if (statusFilter === "BANNED") {
    filtered = filtered.filter((u) => u.isBanned);
  }

  const total = filtered.length;
  const users = filtered.slice((page - 1) * limit, page * limit);

  function buildUrl(params: Record<string, string>) {
    const merged = { search, role: roleFilter, status: statusFilter, page: "1", ...params };
    const qs = new URLSearchParams(merged).toString();
    return `/admin/users?${qs}`;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} total users</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
        {/* Search */}
        <form method="GET" action="/admin/users" className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            name="search"
            defaultValue={search}
            placeholder="Search by name, email or phone…"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30"
          />
          {roleFilter !== "ALL" && <input type="hidden" name="role" value={roleFilter} />}
          {statusFilter !== "ALL" && <input type="hidden" name="status" value={statusFilter} />}
        </form>

        {/* Role tabs */}
        <div className="flex items-center gap-1 flex-wrap">
          {ROLES.map((r) => (
            <Link
              key={r}
              href={buildUrl({ role: r })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === r
                  ? "bg-[#0F7B5A] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {r}
            </Link>
          ))}
          <div className="ml-auto flex items-center gap-1">
            {STATUSES.map((s) => (
              <Link
                key={s}
                href={buildUrl({ status: s })}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-gray-800 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {users.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">BVN</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Trust</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-gray-600">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{user.email}</p>
                      <p className="text-gray-400 text-xs">{user.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3">
                      <BvnBadge status={user.bvnVerificationStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <TrustBar score={user.trustScore} />
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge user={user} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="text-[#0F7B5A] hover:underline text-xs font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={buildUrl({ page: String(page - 1) })}
                  className="px-3 py-1.5 rounded border border-gray-200 text-sm hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}
              {page * limit < total && (
                <Link
                  href={buildUrl({ page: String(page + 1) })}
                  className="px-3 py-1.5 rounded border border-gray-200 text-sm hover:bg-gray-50"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
