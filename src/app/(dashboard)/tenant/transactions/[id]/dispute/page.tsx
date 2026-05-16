"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, CheckCircle, Upload } from "lucide-react";

const DISPUTE_CATEGORIES = [
  {
    value: "NOT_AS_DESCRIBED",
    label: "Not as Described",
    icon: "🏚️",
    desc: "Property condition, amenities, or features differ significantly from the listing.",
  },
  {
    value: "NOT_ACCESSIBLE",
    label: "Cannot Access Property",
    icon: "🔑",
    desc: "Landlord has not provided keys or access to the property on move-in day.",
  },
  {
    value: "MAJOR_DEFECT",
    label: "Major Defect Found",
    icon: "⚠️",
    desc: "A serious structural or utility defect that makes the property uninhabitable.",
  },
  {
    value: "CAUTION_DEPOSIT",
    label: "Caution Deposit Dispute",
    icon: "💰",
    desc: "Disagreement over the caution deposit amount or unlawful deduction.",
  },
  {
    value: "FRAUDULENT_LISTING",
    label: "Fraudulent Listing",
    icon: "🚫",
    desc: "The listing appears to be fraudulent or the property does not exist.",
  },
] as const;

type Category = (typeof DISPUTE_CATEGORIES)[number]["value"];

const SLA_STEPS = [
  { step: "Dispute acknowledged", target: "2 hours" },
  { step: "Evidence collection closes", target: "48 hours" },
  { step: "Mediation resolution", target: "72 hours" },
  { step: "Adjudication decision", target: "7 days" },
];

export default function DisputePage() {
  const params = useParams();
  const router = useRouter();
  const transactionId = params.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [disputeRef, setDisputeRef] = useState("");

  async function handleSubmit() {
    if (!category) {
      setError("Please select a dispute category.");
      return;
    }
    if (description.length < 50) {
      setError("Description must be at least 50 characters.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/${transactionId}/raise-dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to raise dispute");
      setDisputeRef(data.dispute.id);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Dispute Raised</h1>
          <p className="text-gray-500 mb-4">
            Your dispute has been submitted. Our resolution team will review it within 2 hours.
          </p>
          <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm">
            <span className="text-gray-500">Dispute ID:</span>
            <span className="font-mono font-bold text-gray-900 truncate max-w-[200px]">{disputeRef}</span>
          </div>
        </div>

        {/* SLA timeline */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">Resolution Timeline</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-2 text-left text-gray-600 font-medium">Step</th>
                  <th className="py-2 text-right text-gray-600 font-medium">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {SLA_STEPS.map(({ step, target }) => (
                  <tr key={step}>
                    <td className="py-3 text-gray-700">{step}</td>
                    <td className="py-3 text-right font-semibold text-[#0F7B5A]">{target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push(`/tenant/transactions/${transactionId}`)}
            className="py-3 bg-[#0F7B5A] text-white font-semibold rounded-xl hover:bg-[#0a6049] transition-colors text-sm"
          >
            View Transaction
          </button>
          <button
            onClick={() => router.push("/tenant")}
            className="py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 transition-colors text-sm"
          >
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Raise a Dispute</h1>
        <p className="text-gray-500 text-sm mt-1">
          Escrow funds will be held until the dispute is resolved.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Category selector */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-900 mb-4">What&apos;s the issue?</h2>
        <div className="space-y-3">
          {DISPUTE_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                category === cat.value
                  ? "border-amber-500 bg-amber-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-gray-900">{cat.label}</p>
                  {category === cat.value && (
                    <CheckCircle className="w-4 h-4 text-amber-600" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{cat.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-900 mb-3">Describe the issue</h2>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide a detailed description of the problem. Include specific details about what was different from the listing, dates, times, and any communication with the landlord... (minimum 50 characters)"
          rows={6}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 resize-none"
        />
        <div className={`text-xs mt-1 text-right ${description.length >= 50 ? "text-green-600" : "text-gray-400"}`}>
          {description.length}/50 minimum
        </div>
      </div>

      {/* Evidence upload (UI only) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-900 mb-2">Evidence (optional)</h2>
        <p className="text-sm text-gray-500 mb-4">Upload photos or videos to support your claim.</p>
        <div className="grid grid-cols-3 gap-3">
          {photos.map((_, i) => (
            <div key={i} className="aspect-square bg-green-50 border border-green-200 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          ))}
          {photos.length < 6 && (
            <button
              onClick={() => setPhotos((prev) => [...prev, `photo_${Date.now()}`])}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-amber-400 transition-colors group"
            >
              <Upload className="w-5 h-5 text-gray-400 group-hover:text-amber-500 mb-1 transition-colors" />
              <span className="text-xs text-gray-400 group-hover:text-amber-500 transition-colors">Add photo</span>
            </button>
          )}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !category || description.length < 50}
        className="w-full py-3.5 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <AlertTriangle className="w-5 h-5" />
        )}
        {loading ? "Submitting…" : "Submit Dispute"}
      </button>
    </div>
  );
}
