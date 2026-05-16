import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Home, Search, CreditCard, FileText, Shield, ChevronRight, Calendar, Bell } from "lucide-react";
import Link from "next/link";
import { TrustScoreBadge } from "@/components/trust/TrustScoreBadge";

export default async function TenantDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "TENANT") redirect("/login");

  const firstName = session.user.name?.split(" ")[0] ?? "there";
  const trustScore = session.user.trustScore ?? 0;

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
