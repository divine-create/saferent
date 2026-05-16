import { cn } from "@/lib/utils";

interface TrustScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  className?: string;
}

function getScoreColor(score: number) {
  if (score >= 80) return { bg: "bg-green-100", text: "text-green-700", ring: "ring-green-400", label: "Excellent" };
  if (score >= 60) return { bg: "bg-blue-100", text: "text-blue-700", ring: "ring-blue-400", label: "Good" };
  if (score >= 40) return { bg: "bg-yellow-100", text: "text-yellow-700", ring: "ring-yellow-400", label: "Fair" };
  return { bg: "bg-red-100", text: "text-red-700", ring: "ring-red-400", label: "Low" };
}

export function TrustScoreBadge({ score, size = "md", showLabel = true, className }: TrustScoreBadgeProps) {
  const colors = getScoreColor(score);

  const sizeClasses = {
    sm: "w-10 h-10 text-xs",
    md: "w-14 h-14 text-sm",
    lg: "w-20 h-20 text-base",
    xl: "w-24 h-24 text-lg",
  };

  return (
    <div className={cn("flex flex-col items-center gap-1.5", className)}>
      <div
        className={cn(
          "rounded-full flex flex-col items-center justify-center ring-4",
          colors.bg,
          colors.ring,
          sizeClasses[size]
        )}
      >
        <span className={cn("font-bold leading-none", colors.text)}>{score}</span>
        {size !== "sm" && (
          <span className={cn("text-[10px] font-medium", colors.text)}>/ 100</span>
        )}
      </div>
      {showLabel && (
        <div className="text-center">
          <p className="text-xs font-medium text-gray-500">Trust Score</p>
          <p className={cn("text-xs font-semibold", colors.text)}>{colors.label}</p>
        </div>
      )}
    </div>
  );
}

interface TrustScorePillProps {
  score: number;
  className?: string;
}

export function TrustScorePill({ score, className }: TrustScorePillProps) {
  const colors = getScoreColor(score);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        colors.bg,
        colors.text,
        className
      )}
    >
      <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      Trust: {score}/100
    </span>
  );
}
