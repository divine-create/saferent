import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { mockTransactions } from "@/lib/mock-transactions";
import { formatKoboToNaira } from "@/lib/utils";
import { Shield, CheckCircle, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import Link from "next/link";

type SerializedTx = {
  id: string;
  reference: string;
  escrowStatus: string;
  totalAmount: string;
  rentAmount: string;
  moveInDate: string;
  payoutSentAt: string | null;
  listing: { id: string; title: string; address: string };
  tenant: { firstName: string | null; lastName: string | null; email: string | null };
  agreement: { tenantSignedAt: string | null; landlordSignedAt: string | null } | null;
};

async function getTransactions(landlordId: string): Promise<SerializedTx[]> {
  try {
    const txs = await db.escrowTransaction.findMany({
      where: { landlordId },
      orderBy: { createdAt: "desc" },
      include: {
        listing: { select: { id: true, title: true, address: true } },
        tenant: { select: { firstName: true, lastName: true, email: true } },
        agreement: { select: { tenantSignedAt: true, landlordSignedAt: true } },
      },
    });

    return txs.map((tx) => ({
      id: tx.id,
      reference: tx.reference,
      escrowStatus: tx.escrowStatus,
      totalAmount: tx.totalAmount.toString(),
      rentAmount: tx.rentAmount.toString(),
      moveInDate: tx.moveInDate.toISOString(),
      payoutSentAt: tx.payoutSentAt?.toISOString() ?? null,
      listing: tx.listing,
      tenant: tx.tenant,
      agreement: tx.agreement
        ? {
            tenantSignedAt: tx.agreement.tenantSignedAt?.toISOString() ?? null,
            landlordSignedAt: tx.agreement.landlordSignedAt?.toISOString() ?? null,
          }
        : null,
    }));
  } catch {
    return mockTransactions
      .filter((t) => t.landlordId === landlordId)
      .map((t) => ({
        id: t.id,
        reference: t.reference,
        escrowStatus: t.escrowStatus,
        totalAmount: t.totalAmount,
        rentAmount: t.rentAmount,
        moveInDate: t.moveInDate,
        payoutSentAt: t.payoutSentAt,
        listing: { id: t.listing.id, title: t.listing.title, address: t.listing.address },
        tenant: t.tenant,
        agreement: t.agreement
          ? { tenantSignedAt: t.agreement.tenantSignedAt, landlordSignedAt: t.agreement.landlordSignedAt }
          : null,
      }));
  }
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  PENDING_PAYMENT: { label: "Pending Payment", icon: <Clock className="w-3.5 h-3.5" />, color: "text-yellow-700", bgColor: "bg-yellow-100" },
  FUNDED: { label: "In Escrow", icon: <Shield className="w-3.5 h-3.5" />, color: "text-blue-700", bgColor: "bg-blue-100" },
  RELEASED: { label: "Released", icon: <CheckCircle className="w-3.5 h-3.5" />, color: "text-green-700", bgColor: "bg-green-100" },
  REFUNDED: { label: "Refunded", icon: <Clock className="w-3.5 h-3.5" />, color: "text-orange-700", bgColor: "bg-orange-100" },
  DISPUTED: { label: "Disputed", icon: <AlertTriangle className="w-3.5 h-3.5" />, color: "text-red-700", bgColor: "bg-red-100" },
};

export default async function LandlordTransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "LANDLORD") redirect("/landlord");

  const transactions = await getTransactions(session.user.id);

  const pending = transactions.filter((t) => t.escrowStatus === "FUNDED" || t.escrowStatus === "PENDING_PAYMENT");
  const completed = transactions.filter((t) => t.escrowStatus === "RELEASED");
  const disputed = transactions.filter((t) => t.escrowStatus === "DISPUTED");

  const pendingSignatures = transactions.filter(
    (t) => t.agreement && t.agreement.tenantSignedAt && !t.agreement.landlordSignedAt
  );

  const totalPaidOut = completed.reduce((sum, t) => sum + BigInt(t.rentAmount), BigInt(0));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-500 mt-1">Manage your escrow transactions and payouts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active", value: String(pending.length), icon: <Shield className="w-4 h-4" />, color: "text-blue-600 bg-blue-50" },
          { label: "Completed", value: String(completed.length), icon: <CheckCircle className="w-4 h-4" />, color: "text-green-600 bg-green-50" },
          { label: "Disputed", value: String(disputed.length), icon: <AlertTriangle className="w-4 h-4" />, color: "text-red-600 bg-red-50" },
          { label: "Total Paid Out", value: formatKoboToNaira(totalPaidOut), icon: <TrendingUp className="w-4 h-4" />, color: "text-[#0F7B5A] bg-green-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <div className="text-xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Pending signature alert */}
      {pendingSignatures.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-amber-800 text-sm">
              {pendingSignatures.length} agreement{pendingSignatures.length > 1 ? "s" : ""} awaiting your signature
            </p>
            <p className="text-amber-700 text-xs mt-0.5">Tenant has signed — sign to finalise the agreement.</p>
          </div>
          <Link
            href={`/landlord/transactions/${pendingSignatures[0].id}`}
            className="bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors shrink-0"
          >
            Review & Sign
          </Link>
        </div>
      )}

      {/* All transactions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Transactions</h2>
        {transactions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center shadow-sm">
            <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-600">No transactions yet</p>
            <p className="text-gray-400 text-sm mt-1">Transactions appear here when tenants pay via SafeRent Escrow.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => {
              const statusConfig = STATUS_CONFIG[tx.escrowStatus] ?? { label: tx.escrowStatus, icon: null, color: "text-gray-700", bgColor: "bg-gray-100" };
              return (
                <Link
                  key={tx.id}
                  href={`/landlord/transactions/${tx.id}`}
                  className="block bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-[#0F7B5A]/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{tx.listing.title}</p>
                      <p className="text-sm text-gray-500 truncate mt-0.5">{tx.listing.address}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Tenant: {[tx.tenant.firstName, tx.tenant.lastName].filter(Boolean).join(" ") || tx.tenant.email || "—"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-gray-900">{formatKoboToNaira(BigInt(tx.totalAmount))}</p>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full mt-1 ${statusConfig.bgColor} ${statusConfig.color}`}>
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                    <span className="font-mono">{tx.reference}</span>
                    <span>Move-in: {new Date(tx.moveInDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Payout history */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payout History</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">Property</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 hidden sm:table-cell">Reference</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-gray-600">Amount</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-gray-600 hidden sm:table-cell">Payout Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {completed.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900 truncate max-w-[160px]">{tx.listing.title}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-500 hidden sm:table-cell">{tx.reference}</td>
                    <td className="py-3 px-4 text-right font-semibold text-green-700">
                      {formatKoboToNaira(BigInt(tx.rentAmount))}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-500 hidden sm:table-cell">
                      {tx.payoutSentAt
                        ? new Date(tx.payoutSentAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
