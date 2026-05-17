import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { formatKoboToNaira } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import {
  Users,
  Building2,
  CreditCard,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Wallet,
} from "lucide-react";
import Link from "next/link";

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${color} flex-shrink-0 ml-3`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function VerifBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    VERIFIED: "verified",
    PENDING: "pending",
    FAILED: "failed",
    NOT_SUBMITTED: "not_submitted",
  };
  return <Badge variant={(map[status] ?? "default") as never}>{status.replace("_", " ")}</Badge>;
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    TENANT: "bg-blue-100 text-blue-800",
    LANDLORD: "bg-purple-100 text-purple-800",
    AGENT: "bg-amber-100 text-amber-800",
    ADMIN: "bg-gray-100 text-gray-800",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${colors[role] ?? "bg-gray-100 text-gray-700"}`}>
      {role}
    </span>
  );
}

function SlaCountdown({ deadline }: { deadline: Date | null }) {
  if (!deadline) return <span className="text-gray-400 text-xs">—</span>;
  const ms = deadline.getTime() - Date.now();
  const h = Math.floor(ms / 3600000);
  const color = ms < 0 ? "text-red-600" : ms < 8 * 3600000 ? "text-red-500" : ms < 24 * 3600000 ? "text-yellow-600" : "text-green-600";
  const label = ms < 0 ? `${Math.abs(h)}h overdue` : h < 24 ? `${h}h left` : `${Math.floor(h / 24)}d left`;
  return <span className={`text-xs font-medium ${color}`}>{label}</span>;
}

async function getPlatformStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalUsers,
    tenants,
    landlords,
    agents,
    activeListings,
    txThisMonth,
    escrowHeld,
    openDisputes,
    verificationQueue,
    newSignupsToday,
    revenueThisMonth,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: "TENANT" } }),
    db.user.count({ where: { role: "LANDLORD" } }),
    db.user.count({ where: { role: "AGENT" } }),
    db.listing.count({ where: { status: { in: ["VERIFIED_ACTIVE", "UNVERIFIED_ACTIVE"] } } }),
    db.escrowTransaction.findMany({
      where: { createdAt: { gte: startOfMonth } },
      select: { totalAmount: true },
    }),
    db.escrowTransaction.aggregate({
      where: { escrowStatus: "FUNDED" },
      _sum: { totalAmount: true },
    }),
    db.dispute.count({ where: { status: { in: ["OPEN", "EVIDENCE_COLLECTION", "MEDIATION"] } } }),
    db.user.count({ where: { idDocumentStatus: "PENDING" } }),
    db.user.count({ where: { createdAt: { gte: startOfToday } } }),
    db.escrowTransaction.aggregate({
      where: { escrowStatus: "RELEASED", updatedAt: { gte: startOfMonth } },
      _sum: { safeRentFee: true },
    }),
  ]);

  return {
    totalUsers,
    tenants,
    landlords,
    agents,
    activeListings,
    transactionsThisMonth: txThisMonth.length,
    transactionValueThisMonth: txThisMonth.reduce((sum, t) => sum + Number(t.totalAmount), 0),
    escrowHeld: Number(escrowHeld._sum.totalAmount ?? 0),
    openDisputes,
    verificationQueue,
    newSignupsToday,
    platformRevenueThisMonth: Number(revenueThisMonth._sum.safeRentFee ?? 0),
  };
}

async function getRecentSignups() {
  return db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      bvnVerificationStatus: true,
    },
  });
}

async function getOpenDisputes() {
  return db.dispute.findMany({
    where: { status: { in: ["OPEN", "EVIDENCE_COLLECTION", "MEDIATION"] } },
    orderBy: { createdAt: "asc" },
    take: 5,
    select: {
      id: true,
      category: true,
      status: true,
      evidenceDeadline: true,
      transaction: {
        select: {
          reference: true,
          listing: { select: { address: true } },
        },
      },
    },
  });
}

async function getPendingVerifications() {
  const users = await db.user.findMany({
    where: { idDocumentStatus: "PENDING" },
    orderBy: { updatedAt: "asc" },
    take: 5,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
      profile: { select: { governmentIdType: true } },
    },
  });
  return users.map((u) => ({
    id: u.id,
    type: "user" as const,
    name: [u.firstName, u.lastName].filter(Boolean).join(" ") || "Unknown",
    docType: u.profile?.governmentIdType?.replace(/_/g, " ") ?? "ID Document",
  }));
}

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [stats, recentSignups, openDisputes, pendingVerifications] = await Promise.all([
    getPlatformStats(),
    getRecentSignups(),
    getOpenDisputes(),
    getPendingVerifications(),
  ]);

  const metrics = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      subtitle: `${stats.tenants} tenants · ${stats.landlords} landlords · ${stats.agents} agents`,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Active Listings",
      value: stats.activeListings,
      subtitle: "Live on platform",
      icon: Building2,
      color: "bg-purple-500",
    },
    {
      title: "Transactions This Month",
      value: stats.transactionsThisMonth,
      subtitle: formatKoboToNaira(BigInt(stats.transactionValueThisMonth)),
      icon: CreditCard,
      color: "bg-[#0F7B5A]",
    },
    {
      title: "Escrow Held",
      value: formatKoboToNaira(BigInt(stats.escrowHeld)),
      subtitle: "In FUNDED status",
      icon: Wallet,
      color: "bg-emerald-600",
    },
    {
      title: "Open Disputes",
      value: stats.openDisputes,
      subtitle: "Require attention",
      icon: AlertTriangle,
      color: "bg-red-500",
    },
    {
      title: "Verification Queue",
      value: stats.verificationQueue,
      subtitle: "Pending review",
      icon: ShieldCheck,
      color: "bg-yellow-500",
    },
    {
      title: "Platform Revenue",
      value: formatKoboToNaira(BigInt(stats.platformRevenueThisMonth)),
      subtitle: "This month",
      icon: TrendingUp,
      color: "bg-[#D4A017]",
    },
    {
      title: "New Signups Today",
      value: stats.newSignupsToday,
      subtitle: "Last 24 hours",
      icon: UserPlus,
      color: "bg-indigo-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Platform overview — {new Date().toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <MetricCard key={m.title} {...m} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Signups */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Signups</h2>
            <Link href="/admin/users" className="text-xs text-[#0F7B5A] hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentSignups.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No users yet</p>
            )}
            {recentSignups.map((user) => (
              <Link
                key={user.id}
                href={`/admin/users/${user.id}`}
                className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-1.5 -mx-1.5 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-gray-600">
                    {(user.firstName?.[0] ?? "?")}{ (user.lastName?.[0] ?? "")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <RoleBadge role={user.role} />
                  <VerifBadge status={user.bvnVerificationStatus} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Active Disputes */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Active Disputes</h2>
            <Link href="/admin/disputes" className="text-xs text-[#0F7B5A] hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {openDisputes.map((d) => (
              <Link
                key={d.id}
                href={`/admin/disputes/${d.id}`}
                className="block hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-gray-500">{d.transaction.reference}</p>
                    <p className="text-sm font-medium text-gray-900 truncate mt-0.5">
                      {d.category.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{d.transaction.listing.address}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Badge variant={d.status === "OPEN" ? "warning" : "info"}>{d.status.replace("_", " ")}</Badge>
                    <SlaCountdown deadline={d.evidenceDeadline} />
                  </div>
                </div>
              </Link>
            ))}
            {openDisputes.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No active disputes</p>
            )}
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Pending Verifications</h2>
            <Link href="/admin/verification" className="text-xs text-[#0F7B5A] hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {pendingVerifications.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No pending verifications</p>
            )}
            {pendingVerifications.map((v) => (
              <Link
                key={`${v.type}-${v.id}`}
                href={`/admin/users/${v.id}`}
                className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-1.5 -mx-1.5 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{v.name}</p>
                  <p className="text-xs text-gray-400">{v.docType}</p>
                </div>
                <Badge variant="pending">PENDING</Badge>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
