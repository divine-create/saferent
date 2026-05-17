"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface WriteReviewFormProps {
  revieweeId: string;
  transactionId?: string;
  type: "tenant_of_landlord" | "landlord_of_tenant" | "tenant_of_agent";
  onSubmit?: () => void;
  onCancel?: () => void;
}

function StarInput({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-40 shrink-0">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
          >
            <Star
              className={cn(
                "w-5 h-5 transition-colors",
                i <= (hovered || value) ? "fill-[#D4A017] text-[#D4A017]" : "text-gray-200 hover:text-[#D4A017]"
              )}
            />
          </button>
        ))}
      </div>
      {value > 0 && <span className="text-xs text-gray-400">{value}/5</span>}
    </div>
  );
}

export function WriteReviewForm({ revieweeId, transactionId, type, onSubmit, onCancel }: WriteReviewFormProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [conditionRating, setConditionRating] = useState(0);
  const [responsivenessRating, setResponsivenessRating] = useState(0);
  const [accuracyRating, setAccuracyRating] = useState(0);
  const [valueRating, setValueRating] = useState(0);
  const [paymentRating, setPaymentRating] = useState(0);
  const [careRating, setCareRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isTenantReview = type === "tenant_of_landlord" || type === "tenant_of_agent";
  const isLandlordReview = type === "landlord_of_tenant";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (overallRating === 0) {
      setError("Please give an overall rating");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          revieweeId,
          transactionId,
          type,
          overallRating,
          ...(isTenantReview && conditionRating > 0 ? { conditionRating } : {}),
          ...(responsivenessRating > 0 ? { responsivenessRating } : {}),
          ...(isTenantReview && accuracyRating > 0 ? { accuracyRating } : {}),
          ...(isTenantReview && valueRating > 0 ? { valueRating } : {}),
          ...(isLandlordReview && paymentRating > 0 ? { paymentRating } : {}),
          ...(isLandlordReview && careRating > 0 ? { careRating } : {}),
          comment: comment.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        setError(d.error ?? "Failed to submit review");
        return;
      }
      onSubmit?.();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <StarInput value={overallRating} onChange={setOverallRating} label="Overall *" />
        {isTenantReview && (
          <>
            <StarInput value={conditionRating} onChange={setConditionRating} label="Property condition" />
            <StarInput value={responsivenessRating} onChange={setResponsivenessRating} label="Responsiveness" />
            <StarInput value={accuracyRating} onChange={setAccuracyRating} label="Listing accuracy" />
            <StarInput value={valueRating} onChange={setValueRating} label="Value for money" />
          </>
        )}
        {isLandlordReview && (
          <>
            <StarInput value={paymentRating} onChange={setPaymentRating} label="Payment punctuality" />
            <StarInput value={careRating} onChange={setCareRating} label="Property care" />
            <StarInput value={responsivenessRating} onChange={setResponsivenessRating} label="Communication" />
          </>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Comment (optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Share your experience..."
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A]"
        />
        <p className="text-xs text-gray-400 mt-1">{comment.length}/500</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading || overallRating === 0}
          className="flex-1 bg-[#0F7B5A] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#0a6049] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </form>
  );
}
