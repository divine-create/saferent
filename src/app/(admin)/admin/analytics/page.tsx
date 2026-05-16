import { requireAdmin } from "@/lib/admin-auth";
import { mockPlatformStats } from "@/lib/mock-admin";
import { formatKoboToNaira } from "@/lib/utils";

const mockFunnel = [
  { step: "Registered", count: 1247 },
  { step: "Verified", count: 743 },
  { step: "First enquiry", count: 312 },
  { step: "First transaction", count: 89 },
];

const mockListingsByState = [
  { state: "Lagos", count: 97 },
  { state: "Abuja FCT", count: 32 },
  { state: "Rivers", count: 14 },
  { state: "Ogun", count: 8 },
  { state: "Oyo", count: 5 },
];
const maxListings = Math.max(...mockListingsByState.map((s) => s.count));

const mockRevenue = [
  { category: "Transaction fees (5%)", amount: BigInt(622500000) },
  { category: "Document fees", amount: BigInt(34400000) },
  { category: "Agent subscriptions", amount: BigInt(145000000) },
];
const totalRevenue = mockRevenue.reduce((s, r) => s + r.amount, BigInt(0));

const mockActivityFeed = [
  { event: "New user registered", detail: "Emeka Nwosu joined as Agent", time: "2 min ago" },
  { event: "Listing submitted", detail: "3 Bedroom Flat, Lekki submitted for review", time: "15 min ago" },
  { event: "Transaction initiated", detail: "Chidi Okonkwo — SR-2024-ABC12", time: "1 hr ago" },
  { event: "Dispute raised", detail: "NOT_AS_DESCRIBED — SR-2024-XYZ99", time: "3 hr ago" },
  { event: "Listing approved", detail: "2 Bedroom Flat, Surulere — VERIFIED_ACTIVE", time: "5 hr ago" },
  { event: "User verified", detail: "Tunde Bakare — BVN & ID approved", time: "6 hr ago" },
  { event: "Escrow funded", detail: "₦387,500 in escrow — SR-2024-ABC12", time: "8 hr ago" },
  { event: "Payout processed", detail: "SR-2024-DEF34 — ₦219,000 released", time: "12 hr ago" },
  { event: "New user registered", detail: "Blessing Osei joined as Tenant", time: "18 hr ago" },
  { event: "Listing submitted", detail: "Duplex in Wuse 2, Abuja submitted", time: "1 day ago" },
];

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const stats = mockPlatformStats;

  const avgDealSize = BigInt(Math.round(stats.transactionValueThisMonth / stats.transactionsThisMonth));
  const disputeRate = ((stats.openDisputes / stats.transactionsThisMonth) * 100).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-0.5">Platform performance overview</p>
      </div>

      {/* Transaction metrics */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Metrics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="GMV this month"
            value={formatKoboToNaira(BigInt(stats.transactionValueThisMonth))}
            sub="Gross merchandise value"
          />
          <StatCard
            label="Average deal size"
            value={formatKoboToNaira(avgDealSize)}
          />
          <StatCard
            label="Dispute rate"
            value={`${disputeRate}%`}
            sub={`${stats.openDisputes} open disputes`}
          />
          <StatCard
            label="Avg escrow hold"
            value="14 days"
            sub="From funding to release"
          />
        </div>
      </section>

      {/* User funnel */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">User Funnel</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          {mockFunnel.map((step, i) => {
            const pct = Math.round((step.count / mockFunnel[0].count) * 100);
            const conversion = i > 0
              ? Math.round((step.count / mockFunnel[i - 1].count) * 100)
              : 100;
            return (
              <div key={step.step}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#0F7B5A]/10 text-[#0F7B5A] text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-700">{step.step}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    {i > 0 && (
                      <span className="text-gray-400 text-xs">
                        {conversion}% from prev
                      </span>
                    )}
                    <span className="font-semibold text-gray-900">{step.count.toLocaleString()}</span>
                  </div>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0F7B5A] rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listings by state */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Listings by State</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="space-y-3">
              {mockListingsByState.map((s) => {
                const pct = Math.round((s.count / maxListings) * 100);
                return (
                  <div key={s.state} className="flex items-center gap-3">
                    <span className="w-24 text-sm text-gray-700 flex-shrink-0">{s.state}</span>
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-sm text-gray-600 text-right flex-shrink-0">{s.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Revenue breakdown */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h2>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Category</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-600">Amount</th>
                </tr>
              </thead>
              <tbody>
                {mockRevenue.map((r) => (
                  <tr key={r.category} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-700">{r.category}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900">
                      {formatKoboToNaira(r.amount)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-5 py-3 text-gray-900">Total</td>
                  <td className="px-5 py-3 text-right text-[#0F7B5A] font-bold">
                    {formatKoboToNaira(totalRevenue)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Activity feed */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="space-y-0 divide-y divide-gray-50">
            {mockActivityFeed.map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-3">
                <div className="w-2 h-2 rounded-full bg-[#0F7B5A] mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{item.event}</p>
                  <p className="text-xs text-gray-500">{item.detail}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
