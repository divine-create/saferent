import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Building, Users, TrendingUp, Star, ChevronRight, CreditCard, Plus, Crown } from "lucide-react";
import Link from "next/link";

export default async function AgentDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "AGENT") redirect("/login");

  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {firstName}</h1>
          <p className="text-gray-500 mt-1">Your SafeRent agent portal</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400 mb-1">Subscription</div>
          <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-sm font-medium px-3 py-1.5 rounded-full">
            <Crown className="w-3.5 h-3.5" />
            No Active Plan
          </span>
        </div>
      </div>

      {/* Subscription prompt */}
      <div className="bg-gradient-to-r from-[#0F7B5A] to-[#0a6049] rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-bold text-lg">Activate your subscription to go live</p>
            <p className="text-green-100 text-sm mt-1">Choose a plan to start listing properties and building your client pipeline.</p>
            <div className="flex gap-3 mt-4">
              {[
                { plan: "Basic", price: "₦15k/mo", max: "10 listings" },
                { plan: "Pro", price: "₦35k/mo", max: "50 listings" },
                { plan: "Enterprise", price: "₦80k/mo", max: "Unlimited" },
              ].map((p) => (
                <Link
                  key={p.plan}
                  href="/agent/subscription"
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm hover:bg-white/20 transition-colors text-center"
                >
                  <div className="font-bold">{p.plan}</div>
                  <div className="text-green-200 text-xs">{p.price}</div>
                  <div className="text-green-300 text-xs">{p.max}</div>
                </Link>
              ))}
            </div>
          </div>
          <Crown className="w-12 h-12 text-white/20 shrink-0" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Listings", value: "0", icon: <Building className="w-4 h-4" />, color: "text-[#0F7B5A] bg-green-50" },
          { label: "Leads (30 days)", value: "0", icon: <Users className="w-4 h-4" />, color: "text-blue-600 bg-blue-50" },
          { label: "Completed Lets", value: "0", icon: <TrendingUp className="w-4 h-4" />, color: "text-purple-600 bg-purple-50" },
          { label: "Commission YTD", value: "₦0", icon: <CreditCard className="w-4 h-4" />, color: "text-orange-600 bg-orange-50" },
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
            { href: "/agent/listings/new", icon: <Plus className="w-5 h-5 text-[#0F7B5A]" />, title: "New Listing", desc: "Add a property for a landlord client" },
            { href: "/agent/crm", icon: <Users className="w-5 h-5 text-blue-600" />, title: "Client CRM", desc: "Manage landlord clients and tenant pipeline" },
            { href: "/agent/commission", icon: <CreditCard className="w-5 h-5 text-purple-600" />, title: "Commission", desc: "Track earnings and generate invoices" },
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

      {/* Agent score */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Agent Rating</h2>
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-gray-300" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-gray-900">—<span className="text-base text-gray-400">/5.0</span></div>
              <p className="text-sm text-gray-500">Complete lets to build your rating</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            {[
              { label: "Listing accuracy (tenant feedback)", pct: 0 },
              { label: "Response rate & speed", pct: 0 },
              { label: "Deal completion rate", pct: 0 },
              { label: "Client reviews", pct: 0 },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{m.label}</span>
                  <span>{m.pct}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-[#0F7B5A] h-1.5 rounded-full" style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
