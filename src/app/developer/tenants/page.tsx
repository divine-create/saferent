import Link from "next/link";
import { Shield, Building2, Users, TrendingUp } from "lucide-react";

const MOCK_TENANTS = [
  { id: "t1", name: "Adebayo Okafor", unit: "Flat 3A, Heritage Court, Lekki", rent: 2400000, trustScore: 87, leaseStart: "2025-08-15", leaseEnd: "2026-08-15", onTime: 9, late: 1 },
  { id: "t2", name: "Chidi Eze", unit: "Unit 12, Sunset Estate, VI", rent: 4500000, trustScore: 92, leaseStart: "2025-07-01", leaseEnd: "2026-07-01", onTime: 10, late: 0 },
  { id: "t3", name: "Folake Adeyemi", unit: "Unit 8, Sunset Estate, VI", rent: 4500000, trustScore: 71, leaseStart: "2025-06-15", leaseEnd: "2026-06-15", onTime: 7, late: 3 },
  { id: "t4", name: "Emeka Nwosu", unit: "Unit 2, Greenfield Towers, Ikoyi", rent: 8000000, trustScore: 95, leaseStart: "2025-09-30", leaseEnd: "2026-09-30", onTime: 8, late: 0 },
  { id: "t5", name: "Ngozi Obi", unit: "Block B Apt 1, Palm Court, Abuja", rent: 5000000, trustScore: 88, leaseStart: "2025-11-01", leaseEnd: "2026-11-01", onTime: 7, late: 0 },
  { id: "t6", name: "Kemi Balogun", unit: "Studio A, Heritage Court, Lekki", rent: 1200000, trustScore: 79, leaseStart: "2025-10-01", leaseEnd: "2026-10-01", onTime: 8, late: 2 },
];

function formatNaira(n: number) {
  if (n >= 1000000) return `₦${(n / 1000000).toFixed(1)}M`;
  return `₦${(n / 1000).toFixed(0)}K`;
}

function TrustScorePill({ score }: { score: number }) {
  const color = score >= 90 ? "bg-green-100 text-green-800" : score >= 75 ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800";
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>{score}</span>;
}

export default function DeveloperTenantsPage() {
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
            { href: "/developer/tenants", label: "Tenants", icon: Users, active: true },
            { href: "/developer/analytics", label: "Analytics", icon: TrendingUp },
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tenants</h1>
          <p className="text-gray-500 text-sm mb-6">{MOCK_TENANTS.length} active tenants across your portfolio</p>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tenant</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Unit</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rent</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trust Score</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Lease Start</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Lease End</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment History</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_TENANTS.map((t) => (
                    <tr key={t.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 bg-[#0F7B5A]/10 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-[#0F7B5A]">
                              {t.name.charAt(0)}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-gray-800">{t.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-[180px] truncate">{t.unit}</td>
                      <td className="px-4 py-3 text-xs font-medium text-gray-700">{formatNaira(t.rent)}</td>
                      <td className="px-4 py-3">
                        <TrustScorePill score={t.trustScore} />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{t.leaseStart}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{t.leaseEnd}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-green-700 font-medium bg-green-50 px-1.5 py-0.5 rounded">{t.onTime} on time</span>
                          {t.late > 0 && <span className="text-xs text-red-700 font-medium bg-red-50 px-1.5 py-0.5 rounded">{t.late} late</span>}
                        </div>
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
