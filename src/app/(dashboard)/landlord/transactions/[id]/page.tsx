"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Shield, CheckCircle, Clock, AlertTriangle, ArrowLeft, FileText } from "lucide-react";
import { OtpInput } from "@/components/ui/OtpInput";

type Agreement = {
  id: string;
  tenantLegalName: string;
  landlordLegalName: string;
  propertyAddress: string;
  tenancyStartDate: string;
  tenancyEndDate: string;
  rentAmount: string;
  cautionDeposit: string;
  state: string;
  paymentFrequency: string;
  tenantSignedAt: string | null;
  tenantOtpVerified: boolean;
  landlordSignedAt: string | null;
  landlordOtpVerified: boolean;
  pdfUrl: string | null;
};

type Transaction = {
  id: string;
  reference: string;
  escrowStatus: string;
  paymentMethod: string;
  totalAmount: string;
  rentAmount: string;
  cautionAmount: string;
  safeRentFee: string;
  documentFee: string;
  moveInDate: string;
  moveInConfirmedAt: string | null;
  escrowReleasedAt: string | null;
  payoutSentAt: string | null;
  payoutReference: string | null;
  paymentDate: string | null;
  listing: { id: string; title: string; address: string; area: string; state: string; photos: { url: string }[] };
  tenant: { id: string; firstName: string | null; lastName: string | null; email: string | null; phone?: string | null };
  landlord: { id: string; firstName: string | null; lastName: string | null; email: string | null };
  agreement: Agreement | null;
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
    status: string;
    description: string;
  } | null;
};

function formatNairaFromKobo(kobo: string) {
  const n = Number(BigInt(kobo)) / 100;
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  PENDING_PAYMENT: { label: "Pending Payment", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  FUNDED: { label: "In Escrow", color: "text-blue-700", bgColor: "bg-blue-100" },
  RELEASED: { label: "Released", color: "text-green-700", bgColor: "bg-green-100" },
  REFUNDED: { label: "Refunded", color: "text-orange-700", bgColor: "bg-orange-100" },
  DISPUTED: { label: "Disputed", color: "text-red-700", bgColor: "bg-red-100" },
};

export default function LandlordTransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [tx, setTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/transactions/${id}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setTx(data.transaction);
    } catch {
      setError("Failed to load transaction.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSignAgreement() {
    if (!otpValue || otpValue.length !== 6) return;
    setSigning(true);
    setSignError("");
    try {
      const res = await fetch(`/api/transactions/${id}/sign-agreement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ party: "landlord", otpCode: otpValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to sign");
      setTx((prev) => prev ? { ...prev, agreement: data.agreement } : prev);
    } catch (err) {
      setSignError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSigning(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0F7B5A] border-t-transparent" />
      </div>
    );
  }

  if (error || !tx) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <p className="text-red-600">{error || "Transaction not found."}</p>
        <button onClick={() => router.push("/landlord/transactions")} className="mt-4 text-[#0F7B5A] underline text-sm">
          Back to transactions
        </button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[tx.escrowStatus] ?? { label: tx.escrowStatus, color: "text-gray-700", bgColor: "bg-gray-100" };
  const needsLandlordSignature = tx.agreement?.tenantSignedAt && !tx.agreement?.landlordSignedAt;
  const tenantName = [tx.tenant.firstName, tx.tenant.lastName].filter(Boolean).join(" ") || tx.tenant.email || "—";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push("/landlord/transactions")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to transactions
        </button>
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

      {/* Pending signature alert */}
      {needsLandlordSignature && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="font-semibold text-amber-800 text-sm">Agreement awaiting your signature</p>
        </div>
      )}

      {/* Tenant info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-900 mb-4">Tenant Information</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Name</span>
            <span className="font-semibold text-gray-900">{tenantName}</span>
          </div>
          {tx.tenant.email && (
            <div className="flex justify-between">
              <span className="text-gray-600">Email</span>
              <span className="font-semibold text-gray-900">{tx.tenant.email}</span>
            </div>
          )}
          {tx.tenant.phone && (
            <div className="flex justify-between">
              <span className="text-gray-600">Phone</span>
              <span className="font-semibold text-gray-900">{tx.tenant.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Amount breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-900 mb-4">Escrow Details</h2>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-50">
            {[
              { label: "Annual rent", value: formatNairaFromKobo(tx.rentAmount) },
              { label: "Caution deposit", value: formatNairaFromKobo(tx.cautionAmount) },
              { label: "SafeRent fee (5%)", value: formatNairaFromKobo(tx.safeRentFee) },
              { label: "Agreement fee", value: formatNairaFromKobo(tx.documentFee) },
            ].map(({ label, value }) => (
              <tr key={label}>
                <td className="py-2.5 text-gray-600">{label}</td>
                <td className="py-2.5 text-right font-medium text-gray-900">{value}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-gray-200">
              <td className="pt-3 pb-1 font-bold text-gray-900">Total in escrow</td>
              <td className="pt-3 pb-1 text-right font-bold text-[#0F7B5A]">
                {formatNairaFromKobo(tx.totalAmount)}
              </td>
            </tr>
          </tbody>
        </table>
        {tx.paymentDate && (
          <p className="text-xs text-gray-400 mt-3">
            Payment received {new Date(tx.paymentDate).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })} via {tx.paymentMethod.replace("_", " ")}
          </p>
        )}
      </div>

      {/* Payout details */}
      {tx.escrowStatus === "RELEASED" && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="font-bold text-green-800">Payout Released</h2>
          </div>
          <div className="space-y-2 text-sm">
            {tx.escrowReleasedAt && (
              <div className="flex justify-between">
                <span className="text-green-700">Released at</span>
                <span className="font-semibold text-green-900">{new Date(tx.escrowReleasedAt).toLocaleString("en-NG")}</span>
              </div>
            )}
            {tx.payoutSentAt && (
              <div className="flex justify-between">
                <span className="text-green-700">Payout sent</span>
                <span className="font-semibold text-green-900">{new Date(tx.payoutSentAt).toLocaleString("en-NG")}</span>
              </div>
            )}
            {tx.payoutReference && (
              <div className="flex justify-between">
                <span className="text-green-700">Payout reference</span>
                <span className="font-mono font-semibold text-green-900">{tx.payoutReference}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Move-in record */}
      {tx.moveInRecord && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">Move-in Record</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Scheduled date</span>
              <span className="font-semibold text-gray-900">
                {new Date(tx.moveInRecord.scheduledDate).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className={`font-semibold ${tx.moveInRecord.status === "CONFIRMED" ? "text-green-600" : "text-yellow-600"}`}>
                {tx.moveInRecord.status}
              </span>
            </div>
            {tx.moveInRecord.confirmedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Confirmed at</span>
                <span className="font-medium text-gray-900">{new Date(tx.moveInRecord.confirmedAt).toLocaleString("en-NG")}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Agreement */}
      {tx.agreement && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">Tenancy Agreement</h2>

          {/* Signature status */}
          <div className="grid grid-cols-2 gap-3 mb-4">
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
              <p className="font-semibold text-gray-700 text-xs">You (Landlord)</p>
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

          {/* Landlord sign */}
          {needsLandlordSignature && (
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-900">Sign the agreement</p>
              {signError && (
                <p className="text-xs text-red-600">{signError}</p>
              )}
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700">
                Dev mode: use OTP <strong>123456</strong>
              </div>
              <OtpInput length={6} value={otpValue} onChange={setOtpValue} />
              <button
                onClick={handleSignAgreement}
                disabled={signing || otpValue.length !== 6}
                className="w-full py-2.5 bg-[#0F7B5A] text-white font-semibold rounded-lg hover:bg-[#0a6049] transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                {signing ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : null}
                {signing ? "Signing…" : "Sign Agreement"}
              </button>
            </div>
          )}

          {tx.agreement.pdfUrl && (
            <a
              href={tx.agreement.pdfUrl}
              className="flex items-center gap-2 text-sm text-[#0F7B5A] font-medium hover:underline mt-3"
            >
              <FileText className="w-4 h-4" />
              View / Download Agreement PDF
            </a>
          )}
        </div>
      )}

      {/* Dispute */}
      {tx.dispute && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="font-bold text-red-800">Dispute Filed by Tenant</h2>
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
            <p className="text-red-700 text-xs mt-2">{tx.dispute.description}</p>
          </div>
          <div className="mt-3 bg-red-100 rounded-lg p-3 text-xs text-red-700">
            <Shield className="w-4 h-4 inline mr-1" />
            Escrow funds are held until the SafeRent resolution team reaches a decision.
          </div>
        </div>
      )}
    </div>
  );
}
