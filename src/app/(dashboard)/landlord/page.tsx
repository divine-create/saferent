import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Building, Plus, Users, CreditCard, ChevronRight, Shield, TrendingUp, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import { db } from "@/lib/db";
import { formatKoboToNaira } from "@/lib/utils";

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  PENDING_PAYMENT: { label: "Pending Payment", color: "text-yellow-700", bg: "bg-yellow-100" },
  FUNDED: { label: "In Escrow", color: "text-blue-700", bg: "bg-blue-100" },
  RELEASED: { label: "Released", color: "text-green-700", bg: "bg-green-100" },
  REFUNDED: { label: "Refunded", color: "text-orange-700", bg: "bg-orange-100" },
  DISPUTED: { label: "Disputed", color: "text-red-700", bg: "bg-red-100" },
};

type TxSummary = {
  id: string;
  reference: string;
  escrowStatus: string;
  totalAmount: string;
  listing: { title: string; address: string };
  tenant: { firstName: string | null; lastName: string | null; email: string | null };
  agreement: { tenantSignedAt: Date | null; landlordSignedAt: Date | null } | null;
};

async function getRecentTransactions(landlordId: string): Promise<TxSummary[]> {
  try {
    const txs = await db.escrowTransaction.findMany({
      where: { landlordId },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        listing: { select: { title: true, address: true } },
        tenant: { select: { firstName: true, lastName: true, email: true } },
        agreement: { select: { tenantSignedAt: true, landlordSignedAt: true } },
      },
    });
    return txs.map((t) => ({
      id: t.id,
      reference: t.reference,
      escrowStatus: t.escrowStatus,
      totalAmount: t.totalAmount.toString(),
      listing: t.listing,
      tenant: t.tenant,
      agreement: t.agreement,
    }));
  } catch {
    return [];
  }
}

export default async function LandlordDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "LANDLORD") redirect("/login");

  const firstName = session.user.name?.split(" ")[0] ?? "there";
  const recentTransactions = await getRecentTransactions(session.user.id);
  const pendingSignatures = recentTransactions.filter(
    (t) => t.agreement?.tenantSignedAt && !t.agreement?.landlordSignedAt
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {firstName}</h1>
          <p className="text-gray-500 mt-1">Your SafeRent landlord dashboard</p>
        </div>
        <VerificationBadge tier="NONE" />
      </div>

      {/* Verification prompt */}
      {session.user.bvnVerificationStatus !== "VERIFIED" && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-blue-800 text-sm">Get your SafeRent Verified badge</p>
            <p className="text-blue-700 text-xs mt-0.5">Verified landlords receive 3× more enquiries. Upload your title documents to get started.</p>
          </div>
          <Link
            href="/onboarding"
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shrink-0"
          >
            Get Verified
          </Link>
        </div>
      )}

      {/* Portfolio stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Units", value: "0", icon: <Building className="w-4 h-4" />, color: "text-[#0F7B5A] bg-green-50" },
          { label: "Occupied", value: "0", icon: <Users className="w-4 h-4" />, color: "text-blue-600 bg-blue-50" },
          { label: "Vacant", value: "0", icon: <Building className="w-4 h-4" />, color: "text-orange-600 bg-orange-50" },
          { label: "Rent YTD", value: "₦0", icon: <TrendingUp className="w-4 h-4" />, color: "text-purple-600 bg-purple-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-3`}>{s.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { href: "/landlord/listings/new", icon: <Plus className="w-5 h-5 text-[#0F7B5A]" />, title: "Create Listing", desc: "Add a new property to rent out" },
            { href: "/landlord/applications", icon: <Users className="w-5 h-5 text-blue-600" />, title: "View Applications", desc: "Review tenant applications and profiles" },
            { href: "/landlord/payouts", icon: <CreditCard className="w-5 h-5 text-purple-600" />, title: "Payouts", desc: "Track escrow releases and bank transfers" },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-[#0F7B5A]/30 transition-all group"
            >
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-50 transition-colors">
                {a.icon}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{a.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{a.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#0F7B5A] transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Pending signatures alert */}
      {pendingSignatures.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-800 text-sm">
              {pendingSignatures.length} agreement{pendingSignatures.length > 1 ? "s" : ""} awaiting your signature
            </p>
            <p className="text-amber-700 text-xs mt-0.5">Tenant has signed — sign to finalise the tenancy agreement.</p>
          </div>
          <Link
            href={`/landlord/transactions/${pendingSignatures[0].id}`}
            className="bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors shrink-0"
          >
            Sign Now
          </Link>
        </div>
      )}

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          <Link href="/landlord/transactions" className="text-sm text-[#0F7B5A] font-medium hover:underline">
            View all
          </Link>
        </div>
        {recentTransactions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center shadow-sm">
            <CreditCard className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-600">No transactions yet</p>
            <p className="text-xs text-gray-400 mt-1">Transactions appear here when tenants pay via SafeRent Escrow.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((tx) => {
              const status = STATUS_BADGE[tx.escrowStatus] ?? { label: tx.escrowStatus, color: "text-gray-700", bg: "bg-gray-100" };
              const tenantName = [tx.tenant.firstName, tx.tenant.lastName].filter(Boolean).join(" ") || tx.tenant.email || "—";
              return (
                <Link
                  key={tx.id}
                  href={`/landlord/transactions/${tx.id}`}
                  className="block bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-[#0F7B5A]/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{tx.listing.title}</p>
                      <p className="text-xs text-gray-500">Tenant: {tenantName}</p>
                      <p className="text-xs text-gray-400 font-mono mt-1">{tx.reference}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm text-gray-900">{formatKoboToNaira(BigInt(tx.totalAmount))}</p>
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Listings empty state */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">My Listings</h2>
          <Link href="/landlord/listings/new" className="text-sm text-[#0F7B5A] font-medium hover:underline flex items-center gap-1">
            <Plus className="w-4 h-4" /> New Listing
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-gray-300" />
          </div>
          <p className="font-semibold text-gray-600">No listings yet</p>
          <p className="text-gray-400 text-sm mt-1">Create your first listing to start receiving verified tenant applications.</p>
          <Link
            href="/landlord/listings/new"
            className="inline-flex items-center gap-2 mt-4 bg-[#0F7B5A] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#0a6049] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create First Listing
          </Link>
        </div>
      </div>

      {/* Badge progress */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Verification Badge Progress</h2>
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="space-y-4">
            {[
              { tier: "ID Verified (Basic)", desc: "BVN + government-issued ID", done: session.user.bvnVerificationStatus === "VERIFIED" },
              { tier: "Property Verified (Silver)", desc: "Title document + address confirmation", done: false },
              { tier: "SafeRent Certified (Gold)", desc: "Silver + 1 completed transaction, zero disputes", done: false },
            ].map((t, i) => (
              <div key={t.tier} className={`flex items-start gap-3 p-3 rounded-lg ${t.done ? "bg-green-50" : "bg-gray-50"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${t.done ? "bg-green-500" : "bg-gray-200"}`}>
                  {t.done
                    ? <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    : <span className="text-gray-400 text-xs font-bold">{i + 1}</span>}
                </div>
                <div>
                  <p className={`font-semibold text-sm ${t.done ? "text-green-700" : "text-gray-600"}`}>{t.tier}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/onboarding"
            className="flex items-center justify-center gap-2 mt-5 bg-[#0F7B5A] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#0a6049] transition-colors w-full"
          >
            <Shield className="w-4 h-4" />
            Complete Verification
          </Link>
        </div>
      </div>
    </div>
  );
}
