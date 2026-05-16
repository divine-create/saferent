import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Home, Search, CreditCard, FileText, Shield, ChevronRight, Calendar, Bell, MessageCircle } from "lucide-react";
import Link from "next/link";
import { TrustScoreBadge } from "@/components/trust/TrustScoreBadge";
import { db } from "@/lib/db";
import { mockTransactions } from "@/lib/mock-transactions";
import { mockConversations, MOCK_CURRENT_TENANT_ID } from "@/lib/mock-conversations";
import { formatKoboToNaira } from "@/lib/utils";

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  PENDING_PAYMENT: { label: "Pending Payment", color: "text-yellow-700", bg: "bg-yellow-100" },
  FUNDED: { label: "In Escrow", color: "text-blue-700", bg: "bg-blue-100" },
  RELEASED: { label: "Released", color: "text-green-700", bg: "bg-green-100" },
  REFUNDED: { label: "Refunded", color: "text-orange-700", bg: "bg-orange-100" },
  DISPUTED: { label: "Disputed", color: "text-red-700", bg: "bg-red-100" },
};

type ConvSummary = {
  id: string;
  otherName: string;
  listingTitle: string;
  listingArea: string;
  lastMessageText: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

async function getRecentConversations(tenantId: string): Promise<ConvSummary[]> {
  try {
    const convs = await db.conversation.findMany({
      where: { tenantId },
      orderBy: { lastMessageAt: "desc" },
      take: 3,
      include: {
        listing: { select: { title: true, area: true } },
        owner: { select: { firstName: true, lastName: true } },
      },
    });
    return convs.map((c) => ({
      id: c.id,
      otherName: [c.owner.firstName, c.owner.lastName].filter(Boolean).join(" ") || "Landlord",
      listingTitle: c.listing.title,
      listingArea: c.listing.area,
      lastMessageText: c.lastMessageText,
      lastMessageAt: c.lastMessageAt?.toISOString() ?? null,
      unreadCount: c.tenantUnread,
    }));
  } catch {
    // Fallback to mock
    return mockConversations
      .filter((c) => c.tenantId === MOCK_CURRENT_TENANT_ID)
      .slice(0, 3)
      .map((c) => ({
        id: c.id,
        otherName: [c.owner.firstName, c.owner.lastName].filter(Boolean).join(" ") || "Landlord",
        listingTitle: c.listing.title,
        listingArea: c.listing.area,
        lastMessageText: c.lastMessageText,
        lastMessageAt: c.lastMessageAt,
        unreadCount: c.tenantUnread,
      }));
  }
}

type TxSummary = {
  id: string;
  reference: string;
  escrowStatus: string;
  totalAmount: string;
  moveInDate: string;
  listing: { title: string; address: string };
};

async function getRecentTransactions(tenantId: string): Promise<TxSummary[]> {
  try {
    const txs = await db.escrowTransaction.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { listing: { select: { title: true, address: true } } },
    });
    return txs.map((t) => ({
      id: t.id,
      reference: t.reference,
      escrowStatus: t.escrowStatus,
      totalAmount: t.totalAmount.toString(),
      moveInDate: t.moveInDate.toISOString(),
      listing: t.listing,
    }));
  } catch {
    return mockTransactions.slice(0, 3).map((t) => ({
      id: t.id,
      reference: t.reference,
      escrowStatus: t.escrowStatus,
      totalAmount: t.totalAmount,
      moveInDate: t.moveInDate,
      listing: { title: t.listing.title, address: t.listing.address },
    }));
  }
}

export default async function TenantDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "TENANT") redirect("/login");

  const firstName = session.user.name?.split(" ")[0] ?? "there";
  const trustScore = session.user.trustScore ?? 0;

  const recentTransactions = await getRecentTransactions(session.user.id);
  const recentConversations = await getRecentConversations(session.user.id);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}</h1>
          <p className="text-gray-500 mt-1">Your SafeRent tenant dashboard</p>
        </div>
        <TrustScoreBadge score={trustScore} size="lg" />
      </div>

      {/* Verification banner */}
      {session.user.bvnVerificationStatus !== "VERIFIED" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-800 text-sm">Complete your verification to unlock full access</p>
            <p className="text-amber-700 text-xs mt-0.5">BVN verification is required to pay via escrow and book viewings.</p>
          </div>
          <Link
            href="/onboarding"
            className="bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors shrink-0"
          >
            Verify Now
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Tenancy", value: "None", icon: <Home className="w-4 h-4" />, color: "text-[#0F7B5A] bg-green-50" },
          { label: "Saved Listings", value: "0", icon: <Search className="w-4 h-4" />, color: "text-blue-600 bg-blue-50" },
          { label: "Scheduled Viewings", value: "0", icon: <Calendar className="w-4 h-4" />, color: "text-purple-600 bg-purple-50" },
          { label: "Notifications", value: "0", icon: <Bell className="w-4 h-4" />, color: "text-orange-600 bg-orange-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              href: "/listings",
              icon: <Search className="w-5 h-5 text-[#0F7B5A]" />,
              title: "Search Listings",
              desc: "Find verified properties across Nigeria",
            },
            {
              href: "/tenant/viewings",
              icon: <Calendar className="w-5 h-5 text-purple-600" />,
              title: "My Viewings",
              desc: "Manage booked and upcoming property viewings",
            },
            {
              href: "/tenant/payments",
              icon: <CreditCard className="w-5 h-5 text-blue-600" />,
              title: "Payments",
              desc: "Track escrow transactions and receipts",
            },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-[#0F7B5A]/30 transition-all group"
            >
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-50 transition-colors">
                {action.icon}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{action.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{action.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#0F7B5A] transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* My Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">My Transactions</h2>
          <Link href="/tenant/transactions" className="text-sm text-[#0F7B5A] font-medium hover:underline">
            View all
          </Link>
        </div>
        {recentTransactions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center shadow-sm">
            <CreditCard className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-600">No transactions yet</p>
            <p className="text-xs text-gray-400 mt-1">When you pay via SafeRent Escrow, your transactions appear here.</p>
            <Link
              href="/listings"
              className="inline-flex items-center gap-1.5 mt-3 text-sm text-[#0F7B5A] font-medium hover:underline"
            >
              <Search className="w-3.5 h-3.5" />
              Find your next home
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((tx) => {
              const status = STATUS_BADGE[tx.escrowStatus] ?? { label: tx.escrowStatus, color: "text-gray-700", bg: "bg-gray-100" };
              return (
                <Link
                  key={tx.id}
                  href={`/tenant/transactions/${tx.id}`}
                  className="block bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-[#0F7B5A]/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{tx.listing.title}</p>
                      <p className="text-xs text-gray-500 truncate">{tx.listing.address}</p>
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

      {/* Recent Messages */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Messages</h2>
          <Link href="/messages" className="text-sm text-[#0F7B5A] font-medium hover:underline">
            View all messages
          </Link>
        </div>
        {recentConversations.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center shadow-sm">
            <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-600">No messages yet</p>
            <p className="text-xs text-gray-400 mt-1">Enquire about a listing to start a conversation with a landlord.</p>
            <Link href="/listings" className="inline-flex items-center gap-1.5 mt-3 text-sm text-[#0F7B5A] font-medium hover:underline">
              <Search className="w-3.5 h-3.5" />
              Browse listings
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentConversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/messages?conversation=${conv.id}`}
                className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-[#0F7B5A]/30 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-[#0F7B5A]/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-[#0F7B5A]">
                    {conv.otherName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{conv.otherName}</p>
                  <p className="text-xs text-gray-500 truncate">{conv.listingArea} · {conv.listingTitle}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{conv.lastMessageText ?? "No messages yet"}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="bg-[#0F7B5A] text-white text-xs font-bold rounded-full px-2 py-0.5 shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Active tenancy */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Tenancy</h2>
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-gray-300" />
          </div>
          <p className="font-semibold text-gray-600">No active tenancy</p>
          <p className="text-gray-400 text-sm mt-1">When you complete a rental via SafeRent, your tenancy details will appear here.</p>
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 mt-4 bg-[#0F7B5A] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#0a6049] transition-colors"
          >
            <Search className="w-4 h-4" />
            Find a Home
          </Link>
        </div>
      </div>

      {/* Trust score breakdown */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Trust Score Breakdown</h2>
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-4xl font-extrabold text-gray-900">{trustScore}<span className="text-xl text-gray-400">/100</span></div>
              <div className="text-sm text-gray-500 mt-1">
                {trustScore >= 80 ? "Excellent — installments available" :
                  trustScore >= 60 ? "Good — full platform access" :
                    trustScore >= 40 ? "Fair — escrow required" :
                      "Restricted — complete verification to unlock"}
              </div>
            </div>
            <TrustScoreBadge score={trustScore} size="xl" />
          </div>
          <div className="space-y-3">
            {[
              { label: "BVN Verified", points: 20, achieved: session.user.bvnVerificationStatus === "VERIFIED" },
              { label: "Phone Verified", points: 15, achieved: session.user.isPhoneVerified },
              { label: "Email Verified", points: 10, achieved: session.user.isEmailVerified },
              { label: "ID Document Verified", points: 10, achieved: false },
              { label: "Employment Verified", points: 15, achieved: false },
              { label: "Previous Landlord Reference", points: 15, achieved: false },
              { label: "Completed Tenancy on SafeRent", points: 10, achieved: false },
              { label: "Zero Disputes", points: 10, achieved: trustScore === 0 ? false : true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.achieved ? "bg-green-100" : "bg-gray-100"}`}>
                    {item.achieved
                      ? <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      : <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
                  </div>
                  <span className={item.achieved ? "text-gray-700" : "text-gray-400"}>{item.label}</span>
                </div>
                <span className={`font-medium ${item.achieved ? "text-green-600" : "text-gray-300"}`}>
                  {item.achieved ? `+${item.points}` : `+${item.points}`}
                </span>
              </div>
            ))}
          </div>
          {trustScore < 80 && (
            <Link
              href="/onboarding"
              className="flex items-center justify-center gap-2 mt-5 bg-[#0F7B5A] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#0a6049] transition-colors w-full"
            >
              <FileText className="w-4 h-4" />
              Boost My Trust Score
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
