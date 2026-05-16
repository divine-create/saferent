"use client";

import { useState } from "react";
import { Shield, CheckCircle, Clock, CreditCard, Building2, Smartphone, Copy, Check, ArrowLeft } from "lucide-react";
import { formatKoboToNaira, calculateEscrowBreakdown } from "@/lib/utils";
import { OtpInput } from "@/components/ui/OtpInput";

type ListingPhoto = { url: string; caption?: string | null };
type ListingOwner = { id: string; firstName: string | null; lastName: string | null; email?: string | null };

export type PaymentFlowListing = {
  id: string;
  title: string;
  address: string;
  area: string;
  state: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  annualRent: string;        // kobo as string
  cautionDeposit: string | null;
  photos: ListingPhoto[];
  owner: ListingOwner;
  status: string;
};

type Props = {
  listing: PaymentFlowListing;
};

type Step = 1 | 2 | 3 | 4;
type PaymentMethod = "CARD" | "BANK_TRANSFER" | "USSD";

type TransactionData = {
  id: string;
  reference: string;
  totalAmount: string;
  rentAmount: string;
  cautionAmount: string;
  safeRentFee: string;
  documentFee: string;
  paymentMethod: string;
  moveInDate: string;
};

type AgreementData = {
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
  landlordSignedAt: string | null;
  pdfUrl: string | null;
};

const STEP_LABELS = ["Review & Confirm", "Payment", "Agreement", "Complete"];
const PROPERTY_TYPE_LABELS: Record<string, string> = {
  FLAT: "Flat", SELF_CONTAINED: "Self-contained", DUPLEX: "Duplex",
  BUNGALOW: "Bungalow", TERRACED_HOUSE: "Terraced House", DETACHED_HOUSE: "Detached House",
  ROOM_AND_PARLOUR: "Room & Parlour", STUDIO: "Studio",
};

function StepBar({ current }: { current: Step }) {
  return (
    <div className="flex items-center justify-between mb-8">
      {STEP_LABELS.map((label, i) => {
        const step = (i + 1) as Step;
        const done = current > step;
        const active = current === step;
        return (
          <div key={label} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  done
                    ? "bg-[#0F7B5A] text-white"
                    : active
                    ? "bg-[#0F7B5A] text-white ring-4 ring-[#0F7B5A]/20"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : step}
              </div>
              <span
                className={`mt-1 text-xs font-medium hidden sm:block ${
                  active ? "text-[#0F7B5A]" : done ? "text-gray-600" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${done ? "bg-[#0F7B5A]" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function PaymentFlow({ listing }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("BANK_TRANSFER");
  const [moveInDate, setMoveInDate] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [agreementState, setAgreementState] = useState<"Lagos" | "Abuja FCT" | "Other">("Lagos");
  const [paymentFrequency, setPaymentFrequency] = useState<"ANNUAL" | "BIANNUAL" | "QUARTERLY" | "MONTHLY">("ANNUAL");
  const [agreement, setAgreement] = useState<AgreementData | null>(null);
  const [generatingAgreement, setGeneratingAgreement] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [signing, setSigning] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  const annualRentKobo = BigInt(listing.annualRent);
  const cautionKobo = listing.cautionDeposit ? BigInt(listing.cautionDeposit) : BigInt(0);
  const breakdown = calculateEscrowBreakdown(annualRentKobo, cautionKobo);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  async function handleInitiate() {
    if (!agreedToTerms) {
      setError("Please agree to the escrow terms to proceed.");
      return;
    }
    if (!moveInDate) {
      setError("Please select a move-in date.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/transactions/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          paymentMethod,
          moveInDate,
          tenancyMonths: 12,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to initiate");
      setTransaction(data.transaction);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmPayment() {
    if (!transaction) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/transactions/${transaction.id}/confirm-payment`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to confirm payment");
      setTransaction((prev) => prev ? { ...prev, ...data.transaction } : data.transaction);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateAgreement() {
    if (!transaction) return;
    setGeneratingAgreement(true);
    setError("");
    try {
      const res = await fetch(`/api/transactions/${transaction.id}/generate-agreement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: agreementState, paymentFrequency }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate agreement");
      setAgreement(data.agreement);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGeneratingAgreement(false);
    }
  }

  async function handleSignAgreement() {
    if (!transaction || !otpValue || otpValue.length !== 6) return;
    setSigning(true);
    setError("");
    try {
      const res = await fetch(`/api/transactions/${transaction.id}/sign-agreement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ party: "tenant", otpCode: otpValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to sign agreement");
      setAgreement(data.agreement);
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSigning(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    });
  }

  const photoUrl = listing.photos[0]?.url;
  const ownerName = [listing.owner.firstName, listing.owner.lastName].filter(Boolean).join(" ") || "Landlord";

  return (
    <div>
      <StepBar current={step} />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Review & Confirm */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Property summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex gap-4 p-5">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={listing.title}
                  className="w-24 h-24 object-cover rounded-xl shrink-0"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-xl shrink-0 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-gray-300" />
                </div>
              )}
              <div className="min-w-0">
                <h2 className="font-bold text-gray-900 text-base leading-snug">{listing.title}</h2>
                <p className="text-sm text-gray-500 mt-1 truncate">{listing.address}</p>
                <p className="text-sm text-gray-400">{listing.area}, {listing.state}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span>{PROPERTY_TYPE_LABELS[listing.propertyType] ?? listing.propertyType}</span>
                  <span>·</span>
                  <span>{listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms} bed`}</span>
                  <span>·</span>
                  <span>{listing.bathrooms} bath</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Landlord: {ownerName}</p>
              </div>
            </div>
          </div>

          {/* Escrow breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-[#0F7B5A]" />
              <h3 className="font-bold text-gray-900">Escrow Breakdown</h3>
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-50">
                {[
                  { label: "Annual rent", value: formatKoboToNaira(breakdown.rentAmount) },
                  { label: "Caution deposit", value: formatKoboToNaira(breakdown.cautionAmount) },
                  { label: "SafeRent fee (5%)", value: formatKoboToNaira(breakdown.safeRentFee) },
                  { label: "Agreement fee", value: formatKoboToNaira(breakdown.documentFee) },
                ].map(({ label, value }) => (
                  <tr key={label} className="py-2">
                    <td className="py-2 text-gray-600">{label}</td>
                    <td className="py-2 text-right font-medium text-gray-900">{value}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-200">
                  <td className="py-3 font-bold text-gray-900">Total</td>
                  <td className="py-3 text-right font-bold text-[#0F7B5A] text-base">
                    {formatKoboToNaira(breakdown.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Move-in date & duration */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4">Move-in Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Preferred move-in date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  min={minDate}
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A]"
                />
              </div>
              <div className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-4 py-3">
                <span className="text-gray-600">Tenancy duration</span>
                <span className="font-semibold text-gray-900">1 year (12 months)</span>
              </div>
            </div>
          </div>

          {/* Escrow terms */}
          <div className="bg-[#0F7B5A]/5 rounded-2xl border border-[#0F7B5A]/20 p-5">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#0F7B5A]" />
              SafeRent Escrow Protection
            </h3>
            <ul className="text-sm text-gray-600 space-y-2 mb-4">
              {[
                "Your payment is held securely in escrow — the landlord cannot access it until you confirm move-in.",
                "If the property is not as described, raise a dispute within 72 hours of move-in for a full refund.",
                "Funds are only released after you confirm successful move-in.",
                "A dedicated dispute resolution team handles all claims within 7 business days.",
              ].map((text) => (
                <li key={text} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#0F7B5A] shrink-0 mt-0.5" />
                  {text}
                </li>
              ))}
            </ul>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#0F7B5A] shrink-0"
              />
              <span className="text-sm text-gray-700">
                I understand and agree to the SafeRent Escrow terms. I confirm the move-in date and tenancy duration above.
              </span>
            </label>
          </div>

          <button
            onClick={handleInitiate}
            disabled={loading || !agreedToTerms || !moveInDate}
            className="w-full py-3.5 bg-[#0F7B5A] text-white font-semibold rounded-xl hover:bg-[#0a6049] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <Shield className="w-5 h-5" />
            )}
            {loading ? "Processing…" : "Proceed to Payment"}
          </button>
        </div>
      )}

      {/* Step 2: Payment Method */}
      {step === 2 && transaction && (
        <div className="space-y-6">
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-1">Select Payment Method</h3>
            <p className="text-sm text-gray-500 mb-5">
              Total: <span className="font-bold text-gray-900">{formatKoboToNaira(BigInt(transaction.totalAmount))}</span>
            </p>

            {/* Method cards */}
            <div className="grid sm:grid-cols-3 gap-3 mb-6">
              {(
                [
                  { value: "CARD" as const, icon: <CreditCard className="w-5 h-5" />, label: "Card Payment", sub: "Visa / Mastercard / Verve" },
                  { value: "BANK_TRANSFER" as const, icon: <Building2 className="w-5 h-5" />, label: "Bank Transfer", sub: "GTBank, UBA, Access, Zenith" },
                  { value: "USSD" as const, icon: <Smartphone className="w-5 h-5" />, label: "USSD", sub: "Any Nigerian bank" },
                ] as const
              ).map(({ value, icon, label, sub }) => (
                <button
                  key={value}
                  onClick={() => setPaymentMethod(value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    paymentMethod === value
                      ? "border-[#0F7B5A] bg-[#0F7B5A]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`mb-2 ${paymentMethod === value ? "text-[#0F7B5A]" : "text-gray-500"}`}>
                    {icon}
                  </div>
                  <p className="font-semibold text-sm text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                </button>
              ))}
            </div>

            {/* Card form */}
            {paymentMethod === "CARD" && (
              <div className="space-y-4 border border-gray-200 rounded-xl p-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Cardholder name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Card number</label>
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A] font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Expiry</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      maxLength={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A] font-mono"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Card details are for demonstration — no real payment is processed.
                </p>
              </div>
            )}

            {/* Bank transfer details */}
            {paymentMethod === "BANK_TRANSFER" && (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3 text-sm">
                <p className="font-semibold text-gray-800 mb-2">Transfer details:</p>
                {[
                  { label: "Bank", value: "GTBank" },
                  { label: "Account Number", value: "0123456789" },
                  { label: "Account Name", value: "SafeRent Escrow Trust Account" },
                  { label: "Amount", value: formatKoboToNaira(BigInt(transaction.totalAmount)) },
                  { label: "Reference", value: transaction.reference },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-semibold text-gray-900">{value}</span>
                  </div>
                ))}
                <button
                  onClick={() => copyToClipboard(`GTBank\n0123456789\nSafeRent Escrow Trust Account\n${formatKoboToNaira(BigInt(transaction.totalAmount))}\n${transaction.reference}`)}
                  className="flex items-center gap-2 text-xs text-[#0F7B5A] font-medium mt-2 hover:underline"
                >
                  {copiedRef ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedRef ? "Copied!" : "Copy details"}
                </button>
              </div>
            )}

            {/* USSD */}
            {paymentMethod === "USSD" && (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-sm">
                <p className="font-semibold text-gray-800 mb-2">Dial this code on any Nigerian mobile line:</p>
                <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3">
                  <code className="font-mono text-lg text-gray-900">
                    *737*1*{Math.round(Number(BigInt(transaction.totalAmount)) / 100)}*{transaction.reference}#
                  </code>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `*737*1*${Math.round(Number(BigInt(transaction.totalAmount)) / 100)}*${transaction.reference}#`
                      )
                    }
                    className="ml-3 text-[#0F7B5A] hover:text-[#0a6049]"
                  >
                    {copiedRef ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Works with GTBank, UBA, Access, Zenith, First Bank and all major Nigerian banks.</p>
              </div>
            )}
          </div>

          <button
            onClick={handleConfirmPayment}
            disabled={loading}
            className="w-full py-3.5 bg-[#0F7B5A] text-white font-semibold rounded-xl hover:bg-[#0a6049] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <Shield className="w-5 h-5" />
            )}
            {loading
              ? "Confirming…"
              : paymentMethod === "BANK_TRANSFER"
              ? "I Have Made the Transfer"
              : "Confirm Payment"}
          </button>
        </div>
      )}

      {/* Step 3: Agreement */}
      {step === 3 && transaction && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-1">Tenancy Agreement</h3>
            <p className="text-sm text-gray-500 mb-5">Review and sign your legally binding tenancy agreement.</p>

            {/* State & frequency selectors */}
            {!agreement && (
              <div className="space-y-4 mb-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Property state</label>
                  <select
                    value={agreementState}
                    onChange={(e) => setAgreementState(e.target.value as "Lagos" | "Abuja FCT" | "Other")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A]"
                  >
                    <option value="Lagos">Lagos</option>
                    <option value="Abuja FCT">Abuja FCT</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment frequency</label>
                  <select
                    value={paymentFrequency}
                    onChange={(e) => setPaymentFrequency(e.target.value as "ANNUAL" | "BIANNUAL" | "QUARTERLY" | "MONTHLY")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A]"
                  >
                    <option value="ANNUAL">Annual</option>
                    <option value="BIANNUAL">Bi-annual</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
                <button
                  onClick={handleGenerateAgreement}
                  disabled={generatingAgreement}
                  className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {generatingAgreement ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : null}
                  {generatingAgreement ? "Generating…" : "Generate Agreement"}
                </button>
              </div>
            )}

            {/* Agreement preview */}
            {agreement && (
              <div className="space-y-4">
                {/* Key terms */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  {[
                    { label: "Tenant", value: agreement.tenantLegalName },
                    { label: "Landlord", value: agreement.landlordLegalName },
                    { label: "Property", value: agreement.propertyAddress },
                    { label: "Tenancy start", value: new Date(agreement.tenancyStartDate).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) },
                    { label: "Tenancy end", value: new Date(agreement.tenancyEndDate).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) },
                    { label: "Annual rent", value: formatKoboToNaira(BigInt(agreement.rentAmount)) },
                    { label: "Caution deposit", value: formatKoboToNaira(BigInt(agreement.cautionDeposit)) },
                    { label: "Payment frequency", value: agreement.paymentFrequency },
                    { label: "State template", value: agreement.state },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-start">
                      <span className="text-gray-500 shrink-0">{label}</span>
                      <span className="font-medium text-gray-900 text-right ml-4">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Full agreement text */}
                <div className="border border-gray-200 rounded-xl p-4 h-64 overflow-y-auto text-xs text-gray-600 leading-relaxed bg-white space-y-3">
                  <p className="font-bold text-gray-800 text-sm text-center">RESIDENTIAL TENANCY AGREEMENT</p>
                  <p className="font-semibold text-gray-700">({agreement.state} Tenancy Law Compliant)</p>
                  <p>
                    This Residential Tenancy Agreement (&ldquo;Agreement&rdquo;) is entered into as of{" "}
                    {new Date(agreement.tenancyStartDate).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })},
                    between:
                  </p>
                  <p>
                    <strong>LANDLORD:</strong> {agreement.landlordLegalName}, hereinafter referred to as &ldquo;Landlord&rdquo;; and
                  </p>
                  <p>
                    <strong>TENANT:</strong> {agreement.tenantLegalName}, hereinafter referred to as &ldquo;Tenant&rdquo;.
                  </p>
                  <p className="font-semibold text-gray-700 mt-2">1. PROPERTY</p>
                  <p>
                    The Landlord agrees to let and the Tenant agrees to take the residential property located at:{" "}
                    <strong>{agreement.propertyAddress}</strong> (&ldquo;the Property&rdquo;).
                  </p>
                  <p className="font-semibold text-gray-700 mt-2">2. TENANCY PERIOD</p>
                  <p>
                    The tenancy shall commence on{" "}
                    {new Date(agreement.tenancyStartDate).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}{" "}
                    and end on{" "}
                    {new Date(agreement.tenancyEndDate).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })},
                    unless terminated earlier in accordance with this Agreement or applicable law.
                  </p>
                  <p className="font-semibold text-gray-700 mt-2">3. RENT</p>
                  <p>
                    The Tenant shall pay an annual rent of{" "}
                    {formatKoboToNaira(BigInt(agreement.rentAmount))} payable on a {agreement.paymentFrequency.toLowerCase()} basis.
                    Rent is due in advance. Late payment shall attract a penalty of 5% per month, capped at 5%.
                  </p>
                  <p className="font-semibold text-gray-700 mt-2">4. CAUTION DEPOSIT</p>
                  <p>
                    The Tenant shall pay a refundable caution deposit of{" "}
                    {formatKoboToNaira(BigInt(agreement.cautionDeposit))}. This deposit shall be held in the SafeRent
                    Escrow Trust Account and returned to the Tenant at the end of the tenancy, less any deductions for
                    damages beyond fair wear and tear.
                  </p>
                  <p className="font-semibold text-gray-700 mt-2">5. ESCROW PAYMENT</p>
                  <p>
                    All payments under this Agreement are processed through SafeRent&apos;s escrow system. Funds are held
                    securely and released to the Landlord only after the Tenant confirms successful move-in or after the
                    72-hour move-in period elapses without a dispute being raised.
                  </p>
                  <p className="font-semibold text-gray-700 mt-2">6. TENANT&apos;S OBLIGATIONS</p>
                  <p>
                    The Tenant agrees to: (a) use the Property solely as a private residence; (b) keep the Property in
                    good order and repair; (c) not sublet without prior written consent; (d) comply with all applicable
                    laws and regulations; (e) give at least 30 days&apos; written notice before vacating.
                  </p>
                  <p className="font-semibold text-gray-700 mt-2">7. LANDLORD&apos;S OBLIGATIONS</p>
                  <p>
                    The Landlord agrees to: (a) ensure the Property is in a habitable condition at the commencement of
                    tenancy; (b) maintain the structural integrity of the Property; (c) not interfere with the Tenant&apos;s
                    quiet enjoyment of the Property; (d) provide at least 30 days&apos; written notice for entry except in
                    emergencies.
                  </p>
                  <p className="font-semibold text-gray-700 mt-2">8. DISPUTE RESOLUTION</p>
                  <p>
                    Any dispute arising from this Agreement shall first be subject to SafeRent&apos;s internal mediation
                    process. If unresolved within 7 business days, the dispute shall be referred to arbitration in
                    accordance with {agreement.state} Tenancy Law and the Arbitration and Conciliation Act.
                  </p>
                  <p className="font-semibold text-gray-700 mt-2">9. NOTICE TO QUIT</p>
                  <p>
                    Either party may terminate this Agreement by giving the other 30 days&apos; written notice. In the event of
                    a material breach, the non-breaching party may terminate with 7 days&apos; notice.
                  </p>
                  <p className="font-semibold text-gray-700 mt-2">10. GOVERNING LAW</p>
                  <p>
                    This Agreement shall be governed by and construed in accordance with the laws of the Federal Republic
                    of Nigeria and specifically the {agreement.state} Tenancy Law (as applicable).
                  </p>
                  <p className="mt-4 text-center text-gray-500">
                    This agreement was generated and facilitated by SafeRent — Nigeria&apos;s Trust-First Rental Marketplace.
                  </p>
                </div>

                {/* Signature status */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className={`rounded-lg p-3 text-center ${agreement.tenantSignedAt ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"}`}>
                    <p className="font-semibold text-gray-700">Tenant</p>
                    {agreement.tenantSignedAt ? (
                      <p className="text-green-600 text-xs mt-1 flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Signed
                      </p>
                    ) : (
                      <p className="text-yellow-600 text-xs mt-1 flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3" /> Pending
                      </p>
                    )}
                  </div>
                  <div className={`rounded-lg p-3 text-center ${agreement.landlordSignedAt ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"}`}>
                    <p className="font-semibold text-gray-700">Landlord</p>
                    {agreement.landlordSignedAt ? (
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

                {/* OTP sign */}
                {!agreement.tenantSignedAt && (
                  <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-semibold text-gray-900">Sign with OTP</p>
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
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && transaction && (
        <div className="space-y-6">
          {/* Animated checkmark */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-5 relative">
              <svg viewBox="0 0 80 80" className="w-full h-full">
                <circle
                  cx="40" cy="40" r="36"
                  fill="none" stroke="#0F7B5A" strokeWidth="4"
                  strokeDasharray="226" strokeDashoffset="0"
                  style={{ animation: "drawCircle 0.6s ease-out forwards" }}
                />
                <path
                  d="M24 40 l12 12 l20-22"
                  fill="none" stroke="#0F7B5A" strokeWidth="4"
                  strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray="50" strokeDashoffset="0"
                  style={{ animation: "drawCheck 0.4s 0.5s ease-out forwards" }}
                />
              </svg>
            </div>
            <style>{`
              @keyframes drawCircle {
                from { stroke-dashoffset: 226; }
                to { stroke-dashoffset: 0; }
              }
              @keyframes drawCheck {
                from { stroke-dashoffset: 50; opacity: 0; }
                to { stroke-dashoffset: 0; opacity: 1; }
              }
            `}</style>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Secured in Escrow</h2>
            <p className="text-gray-500 mb-4">
              Your funds are protected. The landlord cannot access them until you confirm move-in.
            </p>
            <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
              <span className="text-sm text-gray-500">Reference:</span>
              <span className="font-mono font-bold text-gray-900">{transaction.reference}</span>
            </div>
          </div>

          {/* Next steps timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4">What Happens Next</h3>
            <div className="space-y-4">
              {[
                { done: true, label: "Payment received", sub: `${formatKoboToNaira(BigInt(transaction.totalAmount))} secured in escrow` },
                { done: true, label: "Landlord notified", sub: "Landlord has been alerted of your payment" },
                { done: !!agreement?.tenantSignedAt, label: "Sign agreement", sub: agreement?.tenantSignedAt ? "Tenant signed — waiting for landlord" : "Sign your tenancy agreement above" },
                { done: false, label: `Move-in on ${transaction.moveInDate ? new Date(transaction.moveInDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—"}`, sub: "Collect keys and confirm move-in on SafeRent" },
                { done: false, label: "Escrow released", sub: "Funds released to landlord after move-in confirmation" },
              ].map(({ done, label, sub }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${done ? "bg-[#0F7B5A]" : "bg-gray-200"}`}>
                    {done ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-xs text-gray-500 font-bold">{i + 1}</span>
                    )}
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${done ? "text-gray-900" : "text-gray-500"}`}>{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <a
              href={`/tenant/transactions/${transaction.id}`}
              className="flex items-center justify-center gap-2 py-3 bg-[#0F7B5A] text-white font-semibold rounded-xl hover:bg-[#0a6049] transition-colors text-sm"
            >
              View Transaction
            </a>
            <a
              href="/tenant"
              className="flex items-center justify-center gap-2 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 transition-colors text-sm"
            >
              Dashboard
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
