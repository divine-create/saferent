import { cn } from "@/lib/utils";
import { Shield, ShieldCheck, BadgeCheck } from "lucide-react";
import type { BadgeTier } from "@prisma/client";

interface VerificationBadgeProps {
  tier: BadgeTier;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const tierConfig = {
  NONE: {
    label: "Unverified",
    icon: Shield,
    bg: "bg-gray-100",
    text: "text-gray-500",
    border: "border-gray-200",
  },
  ID_VERIFIED: {
    label: "ID Verified",
    icon: Shield,
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  PROPERTY_VERIFIED: {
    label: "Property Verified",
    icon: ShieldCheck,
    bg: "bg-[#0F7B5A]/10",
    text: "text-[#0F7B5A]",
    border: "border-[#0F7B5A]/30",
  },
  CERTIFIED: {
    label: "SafeRent Certified",
    icon: BadgeCheck,
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
};

export function VerificationBadge({ tier, showLabel = true, size = "md", className }: VerificationBadgeProps) {
  const config = tierConfig[tier];
  const IconComponent = config.icon;

  const iconSizes = { sm: "w-3.5 h-3.5", md: "w-4 h-4", lg: "w-5 h-5" };
  const textSizes = { sm: "text-xs", md: "text-xs", lg: "text-sm" };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium",
        config.bg,
        config.text,
        config.border,
        textSizes[size],
        className
      )}
    >
      <IconComponent className={iconSizes[size]} />
      {showLabel && config.label}
    </div>
  );
}
