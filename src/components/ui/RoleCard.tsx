"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface RoleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  isSelected: boolean;
  onClick: () => void;
  value: string;
}

export function RoleCard({
  title,
  description,
  icon,
  features,
  isSelected,
  onClick,
}: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative w-full text-left rounded-xl border-2 p-5 transition-all duration-200 hover:shadow-md",
        isSelected
          ? "border-[#0F7B5A] bg-[#0F7B5A]/5 shadow-md"
          : "border-gray-200 bg-white hover:border-gray-300"
      )}
    >
      {isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#0F7B5A] flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
          isSelected ? "bg-[#0F7B5A] text-white" : "bg-gray-100 text-gray-600"
        )}
      >
        {icon}
      </div>
      <h3
        className={cn(
          "font-semibold text-base mb-1",
          isSelected ? "text-[#0F7B5A]" : "text-gray-900"
        )}
      >
        {title}
      </h3>
      <p className="text-sm text-gray-500 mb-3">{description}</p>
      <ul className="space-y-1.5">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
            <div
              className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0",
                isSelected ? "bg-[#0F7B5A]/20" : "bg-gray-100"
              )}
            >
              <Check
                className={cn(
                  "w-2.5 h-2.5",
                  isSelected ? "text-[#0F7B5A]" : "text-gray-400"
                )}
              />
            </div>
            {feature}
          </li>
        ))}
      </ul>
    </button>
  );
}
