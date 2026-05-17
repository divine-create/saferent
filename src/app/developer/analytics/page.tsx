import Link from "next/link";
import { Shield, Building2, Users, TrendingUp } from "lucide-react";

const OCCUPANCY_TREND = [
  { month: "Dec 25", rate: 70 },
  { month: "Jan 26", rate: 75 },
  { month: "Feb 26", rate: 80 },
  { month: "Mar 26", rate: 80 },
  { month: "Apr 26", rate: 75 },
  { month: "May 26", rate: 75 },
];

const EXPIRY_SCHEDULE = [
  { month: "Jun 2026", units: 1 },
  { month: "Jul 2026", units: 1 },
  { month: "Aug 2026", units: 1 },
  { month: "Sep 2026", units: 1 },
  { month: "Oct 2026", units: 1 },
  { month: "Nov 2026", units: 1 },
];

const MAINTENANCE_SUMMARY = [
  { category: "Plumbing", count: 3, pct: 30 },
  { category: "Electrical", count: 2, pct: 20 },
  { category: "Structural", count: 1, pct: 10 },
  { category: "Appliance", count: 2, pct: 20 },
  { category: "Other", count: 2, pct: 20 },
];

const REVENUE_FORECAST = [
  { month: "Jun 2026", projected: 19400000, confident: "High" },
  { month: "Jul 2026", projected: 16900000, confident: "Medium" },
  { month: "Aug 2026", projected: 21900000, confident: "High" },
];

function formatNaira(n: number) {
  if (n >= 1000000) return `₦${(n / 1000000).toFixed(1)}M`;
  return `₦${(n / 1000).toFixed(0)}K`;
}

export default function DeveloperAnalyticsPage() {
  const maxExpiry = Math.max(...EXPIRY_SCHEDULE.map((e) => e.units));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#0F7B5A] rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">SafeRent</span>
          </Link>
          <div className="mt-1 text-xs text-gray-500 font-medium">Developer Portal</div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {[
            { href: "/developer", label: "Dashboard", icon: Building2 },
            { href: "/developer/units", label: "Units", icon: Building2 },
            { href: "/developer/tenants", label: "Tenants", icon: Users },
            { href: "/developer/analytics", label: "Analytics", icon: TrendingUp, active: true },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                item.active ? "bg-[#0F7B5A]/10 text-[#0F7B5A] font-semibold" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <Link href="/landlord/listings/new" className="block text-xs text-center bg-[#0F7B5A] text-white rounded-lg py-2 font-medium hover:bg-[#0a6049] transition-colors">
            + Add Units
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Estate Analytics</h1>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Occupancy trend */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Occupancy Rate Trend</h2>
              <div className="space-y-2">
                {OCCUPANCY_TREND.map((m) => (
                  <div key={m.month} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-14 shrink-0">{m.month}</span>
                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0F7B5A] rounded-full" style={{ width: `${m.rate}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-10 text-right">{m.rate}%</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">Last 6 months</p>
            </div>

            {/* Maintenance summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 mb-1">Maintenance Requests</h2>
              <p className="text-xs text-gray-400 mb-4">Open requests by category</p>
              <div className="space-y-2">
                {MAINTENANCE_SUMMARY.map((item) => (
                  <div key={item.category} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-20 shrink-0">{item.category}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-400 rounded-full" style={{ width: `${item.pct}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-6 text-right">{item.count}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">10 total open requests</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Expiry schedule */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Lease Expiry Schedule</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Month</th>
                      <th className="text-left pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Units Expiring</th>
                      <th className="pb-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {EXPIRY_SCHEDULE.map((row) => (
                      <tr key={row.month} className="border-t border-gray-50">
                        <td className="py-2 text-xs text-gray-700">{row.month}</td>
                        <td className="py-2 text-xs font-semibold text-gray-900">{row.units}</td>
                        <td className="py-2">
                          <div className="w-24 h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${(row.units / maxExpiry) * 100}%` }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Revenue forecast */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 mb-1">Revenue Forecast</h2>
              <p className="text-xs text-gray-400 mb-4">Next 3 months projected income</p>
              <div className="space-y-3">
                {REVENUE_FORECAST.map((item) => (
                  <div key={item.month} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.month}</p>
                      <p className="text-xs text-gray-400">Confidence: {item.confident}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-gray-900">{formatNaira(item.projected)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${item.confident === "High" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {item.confident}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
