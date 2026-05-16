import { requireAdmin } from "@/lib/admin-auth";
import { mockPlatformStats } from "@/lib/mock-admin";
import { formatKoboToNaira } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Download, Wallet, Clock, TrendingDown, ArrowUpRight } from "lucide-react";

const mockTransactions = [
  {
    id: "txn_001",
    reference: "SR-2024-ABC12",
    tenant: { firstName: "Chidi", lastName: "Okonkwo" },
    landlord: { firstName: "Amaka", lastName: "Eze" },
    listing: { title: "3 Bedroom Flat, Lekki Phase 1" },
    rentAmount: BigInt(350000000),
    totalAmount: BigInt(387500000),
    safeRentFee: BigInt(17500000),
    escrowStatus: "FUNDED",
    paymentDate: new Date("2024-11-20"),
    moveInDate: new Date("2024-12-01"),
    escrowReleasedAt: null as Date | null,
    payoutSentAt: null as Date | null,
    createdAt: new Date("2024-11-18"),
  },
  {
    id: "txn_002",
    reference: "SR-2024-XYZ99",
    tenant: { firstName: "Ngozi", lastName: "Adeyemi" },
    landlord: { firstName: "Tunde", lastName: "Bakare" },
    listing: { title: "Self-Contained Studio, Victoria Island" },
    rentAmount: BigInt(180000000),
    totalAmount: BigInt(207000000),
    safeRentFee: BigInt(9000000),
    escrowStatus: "DISPUTED",
    paymentDate: new Date("2024-11-10"),
    moveInDate: new Date("2024-11-15"),
    escrowReleasedAt: null as Date | null,
    payoutSentAt: null as Date | null,
    createdAt: new Date("2024-11-08"),
  },
  {
    id: "txn_003",
    reference: "SR-2024-DEF34",
    tenant: { firstName: "Kola", lastName: "Adeola" },
    landlord: { firstName: "Amaka", lastName: "Eze" },
    listing: { title: "2 Bedroom Flat, Surulere" },
    rentAmount: BigInt(200000000),
    totalAmount: BigInt(219000000),
    safeRentFee: BigInt(10000000),
    escrowStatus: "RELEASED",
    paymentDate: new Date("2024-10-01"),
    moveInDate: new Date("2024-10-05"),
    escrowReleasedAt: new Date("2024-11-05"),
    payoutSentAt: new Date("2024-11-06"),
    createdAt: new Date("2024-09-28"),
  },
];

const STATUS_BADGE: Record<string, string> = {
  PENDING_PAYMENT: "default",
  FUNDED: "warning",
  RELEASED: "verified",
  REFUNDED: "info",
  DISPUTED: "error",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AdminTransactionsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const sp = await searchParams;
  const tab = sp.tab ?? "all";

  const escrowHeld = mockTransactions
    .filter((t) => t.escrowStatus === "FUNDED" || t.escrowStatus === "DISPUTED")
    .reduce((s, t) => s + t.totalAmount, BigInt(0));

  const pendingPayouts = mockTransactions.filter(
    (t) => t.escrowReleasedAt && !t.payoutSentAt
  );

  const feesCollected = mockTransactions.reduce((s, t) => s + t.safeRentFee, BigInt(0));
  const refunds = mockTransactions.filter((t) => t.escrowStatus === "REFUNDED");

  const displayTxns =
    tab === "payouts"
      ? pendingPayouts
      : tab === "refunds"
      ? refunds
      : mockTransactions;

  const summaryCards = [
    { label: "Escrow held", value: formatKoboToNaira(escrowHeld), icon: Wallet, color: "bg-[#0F7B5A]" },
    { label: "Pending payouts", value: pendingPayouts.length.toString(), icon: Clock, color: "bg-yellow-500" },
    { label: "Fees this month", value: formatKoboToNaira(BigInt(mockPlatformStats.platformRevenueThisMonth)), icon: TrendingDown, color: "bg-blue-500" },
    { label: "Refunds this month", value: formatKoboToNaira(BigInt(0)), icon: ArrowUpRight, color: "bg-red-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500 text-sm mt-0.5">Escrow ledger and financial operations</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{c.label}</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{c.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${c.color}`}>
                <c.icon className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {[
          { key: "all", label: "All Escrow" },
          { key: "payouts", label: `Pending Payouts (${pendingPayouts.length})` },
          { key: "refunds", label: "Refunds" },
        ].map((t) => (
          <Link
            key={t.key}
            href={`/admin/transactions?tab=${t.key}`}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? "border-[#0F7B5A] text-[#0F7B5A]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {displayTxns.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No transactions found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Reference</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Parties</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Property</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  {tab === "payouts" && (
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Action</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {displayTxns.map((t) => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{t.reference}</td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700 text-xs">{t.tenant.firstName} {t.tenant.lastName} (T)</p>
                      <p className="text-gray-500 text-xs">{t.landlord.firstName} {t.landlord.lastName} (LL)</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-xs max-w-40 truncate">{t.listing.title}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{formatKoboToNaira(t.totalAmount)}</p>
                      <p className="text-xs text-gray-400">Fee: {formatKoboToNaira(t.safeRentFee)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={(STATUS_BADGE[t.escrowStatus] ?? "default") as never}>
                        {t.escrowStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {t.paymentDate ? new Date(t.paymentDate).toLocaleDateString("en-NG") : "—"}
                    </td>
                    {tab === "payouts" && (
                      <td className="px-4 py-3 text-right">
                        <button className="px-3 py-1.5 rounded bg-[#0F7B5A] text-white text-xs hover:bg-[#0a6049] transition-colors">
                          Process Payout
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
