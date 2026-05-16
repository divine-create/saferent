import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { mockTransactions } from "@/lib/mock-transactions";
import { formatKoboToNaira } from "@/lib/utils";
import { Shield, CheckCircle, Clock, AlertTriangle, FileText, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MoveInConfirmation } from "@/components/payment/MoveInConfirmation";

type PageProps = { params: Promise<{ id: string }> };

type SerializedTransaction = {
  id: string;
  reference: string;
  escrowStatus: string;
  paymentMethod: string;
  rentAmount: string;
  cautionAmount: string;
  safeRentFee: string;
  documentFee: string;
  totalAmount: string;
  moveInDate: string;
  moveInConfirmedAt: string | null;
  escrowReleasedAt: string | null;
  payoutSentAt: string | null;
  payoutReference: string | null;
  paymentDate: string | null;
  autoReleaseAt: string | null;
  listing: {
    id: string;
    title: string;
    address: string;
    area: string;
    state: string;
    photos: { url: string }[];
  };
  tenant: { id: string; firstName: string | null; lastName: string | null; email: string | null };
  landlord: { id: string; firstName: string | null; lastName: string | null; email: string | null };
  agreement: {
    id: string;
    tenantSignedAt: string | null;
    landlordSignedAt: string | null;
    pdfUrl: string | null;
    tenancyStartDate: string;
    tenancyEndDate: string;
    rentAmount: string;
    cautionDeposit: string;
  } | null;
  moveInRecord: {
    id: string;
    scheduledDate: string;
    status: string;
    confirmedAt: string | null;
    keysHandedOver: boolean;
  } | null;
  dispute: {
    id: string;
    category: string;
    description: string;
    status: string;
    evidenceDeadline: string | null;
  } | null;
};

async function getTransaction(id: string, userId: string): Promise<SerializedTransaction | null> {
  try {
    const tx = await db.escrowTransaction.findUnique({
      where: { id },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            area: true,
            state: true,
            photos: { take: 1, orderBy: { order: "asc" } },
          },
        },
        tenant: { select: { id: true, firstName: true, lastName: true, email: true } },
        landlord: { select: { id: true, firstName: true, lastName: true, email: true } },
        agreement: true,
        moveInRecord: true,
        dispute: true,
      },
    });

    if (!tx) return null;
    if (tx.tenantId !== userId && tx.landlordId !== userId) return null;

    return {
      ...tx,
      rentAmount: tx.rentAmount.toString(),
      cautionAmount: tx.cautionAmount.toString(),
      safeRentFee: tx.safeRentFee.toString(),
      documentFee: tx.documentFee.toString(),
      totalAmount: tx.totalAmount.toString(),
      moveInDate: tx.moveInDate.toISOString(),
      moveInConfirmedAt: tx.moveInConfirmedAt?.toISOString() ?? null,
      escrowReleasedAt: tx.escrowReleasedAt?.toISOString() ?? null,
      payoutSentAt: tx.payoutSentAt?.toISOString() ?? null,
      paymentDate: tx.paymentDate?.toISOString() ?? null,
      autoReleaseAt: tx.autoReleaseAt?.toISOString() ?? null,
      agreement: tx.agreement
        ? {
            ...tx.agreement,
            rentAmount: tx.agreement.rentAmount.toString(),
            cautionDeposit: tx.agreement.cautionDeposit.toString(),
            tenancyStartDate: tx.agreement.tenancyStartDate.toISOString(),
            tenancyEndDate: tx.agreement.tenancyEndDate.toISOString(),
            tenantSignedAt: tx.agreement.tenantSignedAt?.toISOString() ?? null,
            landlordSignedAt: tx.agreement.landlordSignedAt?.toISOString() ?? null,
          }
        : null,
      moveInRecord: tx.moveInRecord
        ? {
            ...tx.moveInRecord,
            scheduledDate: tx.moveInRecord.scheduledDate.toISOString(),
            confirmedAt: tx.moveInRecord.confirmedAt?.toISOString() ?? null,
          }
        : null,
      dispute: tx.dispute
        ? {
            ...tx.dispute,
            evidenceDeadline: tx.dispute.evidenceDeadline?.toISOString() ?? null,
          }
        : null,
    };
  } catch {
    return mockTransactions.find((t) => t.id === id) ?? null;
  }
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  PENDING_PAYMENT: { label: "Pending Payment", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  FUNDED: { label: "In Escrow", color: "text-blue-700", bgColor: "bg-blue-100" },
  RELEASED: { label: "Released", color: "text-green-700", bgColor: "bg-green-100" },
  REFUNDED: { label: "Refunded", color: "text-orange-700", bgColor: "bg-orange-100" },
  DISPUTED: { label: "Disputed", color: "text-red-700", bgColor: "bg-red-100" },
};

const TIMELINE_STEPS = [
  { key: "PENDING_PAYMENT", label: "Payment Initiated", icon: <Shield className="w-4 h-4" /> },
  { key: "FUNDED", label: "Funds Secured in Escrow", icon: <Shield className="w-4 h-4" /> },
  { key: "AGREEMENT", label: "Agreement Signed", icon: <FileText className="w-4 h-4" /> },
  { key: "MOVEIN_SCHEDULED", label: "Move-in Scheduled", icon: <Home className="w-4 h-4" /> },
  { key: "MOVEIN_CONFIRMED", label: "Move-in Confirmed", icon: <CheckCircle className="w-4 h-4" /> },
  { key: "RELEASED", label: "Payout Released", icon: <CheckCircle className="w-4 h-4" /> },
];

function getTimelineProgress(tx: SerializedTransaction): number {
  if (tx.escrowStatus === "RELEASED") return 6;
  if (tx.moveInRecord?.status === "CONFIRMED") return 5;
  if (tx.moveInRecord) return 4;
  if (tx.agreement?.tenantSignedAt && tx.agreement.landlordSignedAt) return 3;
  if (tx.escrowStatus === "FUNDED") return 2;
  return 1;
}

export default async function TenantTransactionPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "TENANT") redirect("/tenant");

  const tx = await getTransaction(id, session.user.id);
  if (!tx) notFound();

  const statusConfig = STATUS_CONFIG[tx.escrowStatus] ?? { label: tx.escrowStatus, color: "text-gray-700", bgColor: "bg-gray-100" };
  const timelineProgress = getTimelineProgress(tx);

  const canConfirmMoveIn =
    tx.escrowStatus === "FUNDED" &&
    !tx.dispute &&
    tx.moveInRecord?.status === "SCHEDULED";

  const canRaiseDispute =
    tx.moveInConfirmedAt &&
    !tx.dispute &&
    (() => {
      const windowEnd = new Date(tx.moveInConfirmedAt!);
      windowEnd.setHours(windowEnd.getHours() + 72);
      return new Date() < windowEnd;
    })();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/tenant"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{tx.listing.title}</h1>
            <p className="text-sm text-gray-500 mt-1">{tx.listing.address}</p>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">{tx.reference}</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Escrow status timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-900 mb-5">Transaction Progress</h2>
        <div className="space-y-4">
          {TIMELINE_STEPS.map((step, i) => {
            const stepNum = i + 1;
            const done = stepNum < timelineProgress;
            const current = stepNum === timelineProgress;
            return (
              <div key={step.key} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  done ? "bg-[#0F7B5A]" : current ? "bg-[#0F7B5A] ring-4 ring-[#0F7B5A]/20" : "bg-gray-200"
                }`}>
                  {done ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : current ? (
                    <span className="text-white">{step.icon}</span>
                  ) : (
                    <span className="text-gray-400">{step.icon}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${done || current ? "text-gray-900" : "text-gray-400"}`}>
                    {step.label}
                  </p>
                </div>
                {current && (
                  <span className="text-xs text-[#0F7B5A] font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Amount breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-900 mb-4">Amount Breakdown</h2>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-50">
            {[
              { label: "Annual rent", value: formatKoboToNaira(BigInt(tx.rentAmount)) },
              { label: "Caution deposit", value: formatKoboToNaira(BigInt(tx.cautionAmount)) },
              { label: "SafeRent fee (5%)", value: formatKoboToNaira(BigInt(tx.safeRentFee)) },
              { label: "Agreement fee", value: formatKoboToNaira(BigInt(tx.documentFee)) },
            ].map(({ label, value }) => (
              <tr key={label}>
                <td className="py-2.5 text-gray-600">{label}</td>
                <td className="py-2.5 text-right font-medium text-gray-900">{value}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-gray-200">
              <td className="pt-3 pb-1 font-bold text-gray-900">Total</td>
              <td className="pt-3 pb-1 text-right font-bold text-[#0F7B5A]">
                {formatKoboToNaira(BigInt(tx.totalAmount))}
              </td>
            </tr>
          </tbody>
        </table>
        {tx.paymentDate && (
          <p className="text-xs text-gray-400 mt-3">
            Paid on {new Date(tx.paymentDate).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })} via {tx.paymentMethod.replace("_", " ")}
          </p>
        )}
        {tx.payoutSentAt && tx.payoutReference && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-700">
            Payout sent on {new Date(tx.payoutSentAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })} · Ref: {tx.payoutReference}
          </div>
        )}
      </div>

      {/* Move-in section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-900 mb-4">Move-in</h2>
        {tx.moveInRecord ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Scheduled date</span>
              <span className="font-semibold text-gray-900">
                {new Date(tx.moveInRecord.scheduledDate).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Status</span>
              <span className={`font-semibold ${tx.moveInRecord.status === "CONFIRMED" ? "text-green-600" : tx.moveInRecord.status === "DISPUTED" ? "text-red-600" : "text-yellow-600"}`}>
                {tx.moveInRecord.status}
              </span>
            </div>
            {tx.moveInRecord.confirmedAt && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Confirmed at</span>
                <span className="font-medium text-gray-900">
                  {new Date(tx.moveInRecord.confirmedAt).toLocaleString("en-NG")}
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Move-in record not yet created.</p>
        )}

        {canConfirmMoveIn && (
          <div className="mt-5 border-t border-gray-100 pt-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Confirm Your Move-in</h3>
            <MoveInConfirmation
              transactionId={tx.id}
              moveInDate={tx.moveInDate}
              onConfirmed={() => {}}
            />
          </div>
        )}
      </div>

      {/* Agreement section */}
      {tx.agreement && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">Tenancy Agreement</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className={`rounded-lg p-3 text-center ${tx.agreement.tenantSignedAt ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"}`}>
                <p className="font-semibold text-gray-700 text-xs">Tenant</p>
                {tx.agreement.tenantSignedAt ? (
                  <p className="text-green-600 text-xs mt-1 flex items-center justify-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Signed
                  </p>
                ) : (
                  <p className="text-yellow-600 text-xs mt-1 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" /> Pending
                  </p>
                )}
              </div>
              <div className={`rounded-lg p-3 text-center ${tx.agreement.landlordSignedAt ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"}`}>
                <p className="font-semibold text-gray-700 text-xs">Landlord</p>
                {tx.agreement.landlordSignedAt ? (
                  <p className="text-green-600 text-xs mt-1 flex items-center justify-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Signed
                  </p>
                ) : (
                  <p className="text-yellow-600 text-xs mt-1 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" /> Pending
                  </p>
                )}
              </div>
            </div>
            {tx.agreement.pdfUrl && (
              <a
                href={tx.agreement.pdfUrl}
                className="flex items-center gap-2 text-sm text-[#0F7B5A] font-medium hover:underline"
              >
                <FileText className="w-4 h-4" />
                View / Download Agreement PDF
              </a>
            )}
          </div>
        </div>
      )}

      {/* Dispute section */}
      {tx.dispute ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="font-bold text-red-800">Dispute Active</h2>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-red-700">Category</span>
              <span className="font-semibold text-red-900">{tx.dispute.category.replace(/_/g, " ")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-700">Status</span>
              <span className="font-semibold text-red-900">{tx.dispute.status.replace(/_/g, " ")}</span>
            </div>
            {tx.dispute.evidenceDeadline && (
              <div className="flex justify-between">
                <span className="text-red-700">Evidence deadline</span>
                <span className="font-semibold text-red-900">
                  {new Date(tx.dispute.evidenceDeadline).toLocaleString("en-NG")}
                </span>
              </div>
            )}
            <p className="text-red-700 mt-2 text-xs">{tx.dispute.description}</p>
          </div>
        </div>
      ) : canRaiseDispute ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-amber-800">72-Hour Dispute Window Open</h2>
          </div>
          <p className="text-amber-700 text-sm mb-4">
            If anything about the property is not as described, you can raise a dispute now.
          </p>
          <Link
            href={`/tenant/transactions/${tx.id}/dispute`}
            className="inline-flex items-center gap-2 py-2.5 px-4 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            Raise a Dispute
          </Link>
        </div>
      ) : null}
    </div>
  );
}
