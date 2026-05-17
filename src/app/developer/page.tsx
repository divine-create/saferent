import Link from "next/link";
import { Shield, Building2, TrendingUp, Users, AlertTriangle, ChevronRight } from "lucide-react";

// Mock developer portfolio data
const MOCK_UNITS = [
  { id: "u1", address: "Flat 3A, Heritage Court, Lekki", type: "FLAT", beds: 2, tenant: "Adebayo Okafor", rent: 2400000, leaseExpiry: "2026-08-15", status: "OCCUPIED" },
  { id: "u2", address: "Flat 5B, Heritage Court, Lekki", type: "FLAT", beds: 2, tenant: null, rent: 2400000, leaseExpiry: null, status: "VACANT" },
  { id: "u3", address: "Unit 12, Sunset Estate, VI", type: "FLAT", beds: 3, tenant: "Chidi Eze", rent: 4500000, leaseExpiry: "2026-07-01", status: "OCCUPIED" },
  { id: "u4", address: "Unit 8, Sunset Estate, VI", type: "FLAT", beds: 3, tenant: "Folake Adeyemi", rent: 4500000, leaseExpiry: "2026-06-15", status: "EXPIRING" },
  { id: "u5", address: "Unit 2, Greenfield Towers, Ikoyi", type: "FLAT", beds: 4, tenant: "Emeka Nwosu", rent: 8000000, leaseExpiry: "2026-09-30", status: "OCCUPIED" },
  { id: "u6", address: "Unit 7, Greenfield Towers, Ikoyi", type: "FLAT", beds: 4, tenant: null, rent: 8000000, leaseExpiry: null, status: "VACANT" },
  { id: "u7", address: "Block B Apt 1, Palm Court, Abuja", type: "FLAT", beds: 3, tenant: "Ngozi Obi", rent: 5000000, leaseExpiry: "2026-11-01", status: "OCCUPIED" },
  { id: "u8", address: "Block B Apt 2, Palm Court, Abuja", type: "FLAT", beds: 3, tenant: null, rent: 5000000, leaseExpiry: null, status: "VACANT" },
];

const MONTHLY_REVENUE = [
  { month: "Jun 25", amount: 14400000 },
  { month: "Jul 25", amount: 14400000 },
  { month: "Aug 25", amount: 16900000 },
  { month: "Sep 25", amount: 16900000 },
  { month: "Oct 25", amount: 19400000 },
  { month: "Nov 25", amount: 19400000 },
  { month: "Dec 25", amount: 16900000 },
  { month: "Jan 26", amount: 19400000 },
  { month: "Feb 26", amount: 21900000 },
  { month: "Mar 26", amount: 21900000 },
  { month: "Apr 26", amount: 21900000 },
  { month: "May 26", amount: 19400000 },
];

const STATUS_COLORS: Record<string, string> = {
  OCCUPIED: "bg-green-100 text-green-800",
  VACANT: "bg-gray-100 text-gray-600",
  EXPIRING: "bg-yellow-100 text-yellow-700",
};

function formatNaira(n: number) {
  if (n >= 1000000) return `₦${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `₦${(n / 1000).toFixed(0)}K`;
  return `₦${n}`;
}

export default function DeveloperDashboardPage() {
  const occupied = MOCK_UNITS.filter((u) => u.status === "OCCUPIED" || u.status === "EXPIRING").length;
  const vacant = MOCK_UNITS.filter((u) => u.status === "VACANT").length;
  const total = MOCK_UNITS.length;
  const occupancyRate = Math.round((occupied / total) * 100);
  const ytdRevenue = MONTHLY_REVENUE.reduce((s, m) => s + m.amount, 0);
  const maxRevenue = Math.max(...MONTHLY_REVENUE.map((m) => m.amount));

  const expiringUnits = MOCK_UNITS.filter((u) => u.status === "EXPIRING");

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
            { href: "/developer", label: "Dashboard", icon: Building2, active: true },
            { href: "/developer/units", label: "Units", icon: Building2 },
            { href: "/developer/tenants", label: "Tenants", icon: Users },
            { href: "/developer/analytics", label: "Analytics", icon: TrendingUp },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                item.active
                  ? "bg-[#0F7B5A]/10 text-[#0F7B5A] font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
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

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Portfolio Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">Heritage Estates Ltd · Enterprise Account</p>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Total Units</p>
              <p className="text-4xl font-extrabold text-gray-900">{total}</p>
              <p className="text-xs text-gray-400 mt-1">Across 3 estates</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Occupancy Rate</p>
              <p className="text-4xl font-extrabold text-[#0F7B5A]">{occupancyRate}%</p>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#0F7B5A] rounded-full" style={{ width: `${occupancyRate}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{occupied} occupied · {vacant} vacant</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">YTD Revenue</p>
              <p className="text-2xl font-extrabold text-gray-900">{formatNaira(ytdRevenue)}</p>
              <p className="text-xs text-[#0F7B5A] mt-1">+12% vs last year</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Expiring Soon</p>
              <p className="text-4xl font-extrabold text-yellow-600">{expiringUnits.length}</p>
              <p className="text-xs text-gray-400 mt-1">Within 30 days</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Monthly Rent Collected</h2>
              <div className="space-y-2">
                {MONTHLY_REVENUE.map((m) => (
                  <div key={m.month} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-12 shrink-0">{m.month}</span>
                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0F7B5A] rounded-full transition-all"
                        style={{ width: `${(m.amount / maxRevenue) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700 w-16 text-right">{formatNaira(m.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Alerts</h2>
              <div className="space-y-3">
                {expiringUnits.map((u) => (
                  <div key={u.id} className="flex gap-3 bg-yellow-50 rounded-xl p-3">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{u.address}</p>
                      <p className="text-xs text-gray-500">Expires {u.leaseExpiry}</p>
                    </div>
                  </div>
                ))}
                {expiringUnits.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No urgent alerts</p>
                )}
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs text-gray-500 font-medium mb-2">Quick Actions</p>
                  <Link href="/developer/units" className="flex items-center justify-between text-sm text-[#0F7B5A] hover:underline py-1">
                    <span>View all units</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <Link href="/developer/analytics" className="flex items-center justify-between text-sm text-[#0F7B5A] hover:underline py-1">
                    <span>Analytics</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Units table preview */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Units Overview</h2>
              <Link href="/developer/units" className="text-sm text-[#0F7B5A] font-medium hover:underline">
                View all →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Unit</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Beds</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tenant</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rent</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Lease Expiry</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_UNITS.slice(0, 6).map((unit) => (
                    <tr key={unit.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800 text-xs">{unit.address}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{unit.beds} bed</td>
                      <td className="px-4 py-3 text-gray-700 text-xs">{unit.tenant ?? <span className="text-gray-400">Vacant</span>}</td>
                      <td className="px-4 py-3 text-gray-700 text-xs font-medium">{formatNaira(unit.rent)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{unit.leaseExpiry ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[unit.status]}`}>
                          {unit.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
