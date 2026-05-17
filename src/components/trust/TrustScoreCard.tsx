"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  CheckCircle,
  Circle,
  Shield,
  Phone,
  Mail,
  FileText,
  Briefcase,
  Home,
  AlertTriangle,
  User,
  ArrowRight,
} from "lucide-react";

interface TrustScoreBreakdown {
  bvnVerified: number;
  ninVerified: number;
  idDocumentVerified: number;
  employmentVerified: number;
  landlordReference: number;
  rentalHistory: number;
  zeroDisputes: number;
  profileComplete: number;
  total: number;
}

interface TrustScoreCardProps {
  score: number;
  breakdown: TrustScoreBreakdown;
  band: "excellent" | "good" | "fair" | "restricted";
  unlockedFeatures: string[];
  className?: string;
}

const bandConfig = {
  excellent: {
    label: "Excellent",
    sublabel: "Installments unlocked",
    color: "text-green-700",
    bg: "bg-green-50",
    ring: "ring-green-400",
    bar: "bg-green-500",
  },
  good: {
    label: "Good",
    sublabel: "Full access",
    color: "text-blue-700",
    bg: "bg-blue-50",
    ring: "ring-blue-400",
    bar: "bg-blue-500",
  },
  fair: {
    label: "Fair",
    sublabel: "Escrow required",
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    ring: "ring-yellow-400",
    bar: "bg-yellow-500",
  },
  restricted: {
    label: "Restricted",
    sublabel: "Complete verification",
    color: "text-red-700",
    bg: "bg-red-50",
    ring: "ring-red-400",
    bar: "bg-red-400",
  },
};

interface ScoreItem {
  label: string;
  icon: React.ReactNode;
  earned: number;
  max: number;
  hint: string;
}

export function TrustScoreCard({ score, breakdown, band, unlockedFeatures, className }: TrustScoreCardProps) {
  const cfg = bandConfig[band];

  const items: ScoreItem[] = [
    {
      label: "BVN Verified",
      icon: <Shield className="w-4 h-4" />,
      earned: breakdown.bvnVerified,
      max: 20,
      hint: "Complete BVN verification",
    },
    {
      label: "NIN Verified",
      icon: <FileText className="w-4 h-4" />,
      earned: breakdown.ninVerified,
      max: 10,
      hint: "Add your NIN",
    },
    {
      label: "ID Document",
      icon: <FileText className="w-4 h-4" />,
      earned: breakdown.idDocumentVerified,
      max: 10,
      hint: "Upload government-issued ID",
    },
    {
      label: "Employment Verified",
      icon: <Briefcase className="w-4 h-4" />,
      earned: breakdown.employmentVerified,
      max: 15,
      hint: "Upload payslip and bank statement",
    },
    {
      label: "Landlord Reference",
      icon: <Home className="w-4 h-4" />,
      earned: breakdown.landlordReference,
      max: 15,
      hint: "Provide landlord reference",
    },
    {
      label: "Rental History",
      icon: <Home className="w-4 h-4" />,
      earned: breakdown.rentalHistory,
      max: 30,
      hint: "Complete tenancies on SafeRent",
    },
    {
      label: "Zero Disputes",
      icon: <AlertTriangle className="w-4 h-4" />,
      earned: breakdown.zeroDisputes,
      max: 10,
      hint: "Maintain a clean dispute record",
    },
    {
      label: "Profile Complete",
      icon: <User className="w-4 h-4" />,
      earned: breakdown.profileComplete,
      max: 10,
      hint: "Fill in all profile fields",
    },
  ];

  const unverified = items.filter((i) => i.earned < i.max);
  const pct = Math.min(score, 100);

  return (
    <div className={cn("bg-white rounded-xl border border-gray-100 shadow-sm p-6", className)}>
      {/* Score ring */}
      <div className="flex items-start gap-6 mb-6">
        <div className="shrink-0">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke={
                  band === "excellent"
                    ? "#16a34a"
                    : band === "good"
                    ? "#2563eb"
                    : band === "fair"
                    ? "#ca8a04"
                    : "#dc2626"
                }
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * 201} 201`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-2xl font-extrabold", cfg.color)}>{score}</span>
              <span className="text-[10px] text-gray-400">/100</span>
            </div>
          </div>
        </div>
        <div className="flex-1 pt-1">
          <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold mb-2", cfg.bg, cfg.color)}>
            <Shield className="w-3.5 h-3.5" />
            {cfg.label} — {cfg.sublabel}
          </div>
          <div className="space-y-1">
            {unlockedFeatures.slice(0, 3).map((f) => (
              <div key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Breakdown rows */}
      <div className="space-y-2.5 mb-5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                item.earned >= item.max ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
              )}
            >
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className={item.earned >= item.max ? "text-gray-800 font-medium" : "text-gray-500"}>
                  {item.label}
                </span>
                <span className={cn("font-semibold text-xs", item.earned > 0 ? "text-green-600" : "text-gray-300")}>
                  {item.earned}/{item.max} pts
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className={cn("h-1.5 rounded-full transition-all", cfg.bar)}
                  style={{ width: `${(item.earned / item.max) * 100}%` }}
                />
              </div>
            </div>
            {item.earned >= item.max ? (
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-gray-300 shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Improve section */}
      {unverified.length > 0 && (
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold text-gray-700 mb-3">
            Improve your score — up to +{unverified.reduce((s, i) => s + (i.max - i.earned), 0)} pts available
          </p>
          <div className="space-y-2">
            {unverified.slice(0, 3).map((item) => (
              <div key={item.label} className="flex items-center justify-between text-xs">
                <span className="text-gray-500">{item.hint}</span>
                <span className="font-semibold text-[#0F7B5A]">+{item.max - item.earned} pts</span>
              </div>
            ))}
          </div>
          <Link
            href="/onboarding"
            className="flex items-center justify-center gap-2 mt-4 bg-[#0F7B5A] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#0a6049] transition-colors w-full"
          >
            Boost My Score
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
