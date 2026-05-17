"use client";

import { useState } from "react";
import { Star, Flag, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  review: {
    id: string;
    overallRating: number;
    conditionRating?: number | null;
    responsivenessRating?: number | null;
    accuracyRating?: number | null;
    valueRating?: number | null;
    paymentRating?: number | null;
    careRating?: number | null;
    comment?: string | null;
    response?: string | null;
    createdAt: string;
    type: string;
    reviewer: { firstName: string | null; lastName: string | null };
  };
  showFlagButton?: boolean;
  onFlag?: (id: string) => void;
}

function StarRating({ rating, max = 5, size = "sm" }: { rating: number; max?: number; size?: "sm" | "md" }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4",
            i < rating ? "fill-[#D4A017] text-[#D4A017]" : "text-gray-200"
          )}
        />
      ))}
    </div>
  );
}

const subRatings = [
  { key: "conditionRating", label: "Condition" },
  { key: "responsivenessRating", label: "Responsiveness" },
  { key: "accuracyRating", label: "Accuracy" },
  { key: "valueRating", label: "Value for money" },
  { key: "paymentRating", label: "Payment punctuality" },
  { key: "careRating", label: "Property care" },
] as const;

export function ReviewCard({ review, showFlagButton, onFlag }: ReviewCardProps) {
  const [showSubRatings, setShowSubRatings] = useState(false);
  const reviewerName = [review.reviewer.firstName, review.reviewer.lastName].filter(Boolean).join(" ") || "Anonymous";
  const initials = reviewerName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const date = new Date(review.createdAt).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" });

  const hasSubRatings = subRatings.some((r) => review[r.key] != null);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#0F7B5A]/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-[#0F7B5A]">{initials}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{reviewerName}</p>
            <p className="text-xs text-gray-400">{date}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarRating rating={review.overallRating} />
          <span className="text-sm font-bold text-gray-700">{review.overallRating}/5</span>
        </div>
      </div>

      {review.comment && (
        <p className="text-sm text-gray-700 leading-relaxed mb-3">{review.comment}</p>
      )}

      {hasSubRatings && (
        <button
          onClick={() => setShowSubRatings(!showSubRatings)}
          className="flex items-center gap-1.5 text-xs text-[#0F7B5A] font-medium mb-3 hover:underline"
        >
          {showSubRatings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {showSubRatings ? "Hide" : "Show"} detailed ratings
        </button>
      )}

      {showSubRatings && hasSubRatings && (
        <div className="grid grid-cols-2 gap-2 mb-3 p-3 bg-gray-50 rounded-lg">
          {subRatings.map((r) => {
            const val = review[r.key];
            if (val == null) return null;
            return (
              <div key={r.key} className="flex items-center justify-between gap-2">
                <span className="text-xs text-gray-500">{r.label}</span>
                <StarRating rating={val} />
              </div>
            );
          })}
        </div>
      )}

      {review.response && (
        <div className="bg-green-50 border border-green-100 rounded-lg p-3">
          <p className="text-xs font-semibold text-green-700 mb-1">Response from owner</p>
          <p className="text-xs text-green-800">{review.response}</p>
        </div>
      )}

      {showFlagButton && onFlag && (
        <div className="flex justify-end mt-2">
          <button
            onClick={() => onFlag(review.id)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            <Flag className="w-3 h-3" />
            Flag as inappropriate
          </button>
        </div>
      )}
    </div>
  );
}
