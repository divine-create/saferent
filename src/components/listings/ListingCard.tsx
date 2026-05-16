"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, Bed, Bath, CheckCircle, Building2, Home, Layers, BedDouble } from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export type ListingCardData = {
  id: string;
  title: string;
  slug?: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  lga: string;
  state: string;
  annualRent: number;
  paymentFrequencies: string[];
  furnishingStatus: string;
  isVerified: boolean;
  status: string;
  photos: { url: string; caption?: string | null }[];
  owner: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    landlordVerification?: { badgeTier: string } | null;
  };
};

const PROPERTY_TYPE_ICONS: Record<string, React.ReactNode> = {
  FLAT: <Building2 className="w-3.5 h-3.5" />,
  SELF_CONTAINED: <Home className="w-3.5 h-3.5" />,
  DUPLEX: <Layers className="w-3.5 h-3.5" />,
  BUNGALOW: <Home className="w-3.5 h-3.5" />,
  TERRACED_HOUSE: <Home className="w-3.5 h-3.5" />,
  DETACHED_HOUSE: <Home className="w-3.5 h-3.5" />,
  ROOM_AND_PARLOUR: <BedDouble className="w-3.5 h-3.5" />,
  STUDIO: <Building2 className="w-3.5 h-3.5" />,
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  FLAT: "Flat",
  SELF_CONTAINED: "Self-contained",
  DUPLEX: "Duplex",
  BUNGALOW: "Bungalow",
  TERRACED_HOUSE: "Terraced House",
  DETACHED_HOUSE: "Detached House",
  ROOM_AND_PARLOUR: "Room & Parlour",
  STUDIO: "Studio",
};

const BADGE_TIER_COLORS: Record<string, string> = {
  CERTIFIED: "bg-[#D4A017] text-white",
  PROPERTY_VERIFIED: "bg-[#0F7B5A] text-white",
  ID_VERIFIED: "bg-blue-600 text-white",
  NONE: "bg-gray-200 text-gray-600",
};

const BADGE_TIER_LABELS: Record<string, string> = {
  CERTIFIED: "SafeRent Certified",
  PROPERTY_VERIFIED: "Property Verified",
  ID_VERIFIED: "ID Verified",
  NONE: "Unverified",
};

const FREQ_LABELS: Record<string, string> = {
  ANNUAL: "p.a.",
  BIANNUAL: "per 6mo",
  QUARTERLY: "per quarter",
  MONTHLY: "per month",
};

interface ListingCardProps {
  listing: ListingCardData;
  className?: string;
  isAuthenticated?: boolean;
}

export function ListingCard({ listing, className, isAuthenticated = false }: ListingCardProps) {
  const [saved, setSaved] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);

  const href = `/listings/${listing.id}`;
  const photoUrl = listing.photos[0]?.url;
  const ownerName = [listing.owner.firstName, listing.owner.lastName].filter(Boolean).join(" ") || "Landlord";
  const badgeTier = listing.owner.landlordVerification?.badgeTier ?? "NONE";
  const primaryFreq = listing.paymentFrequencies[0] ?? "ANNUAL";

  async function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    if (!isAuthenticated) return;
    setSavingLoading(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}/save`, { method: "POST" });
      const data = await res.json();
      setSaved(data.saved);
    } catch {
      // silent
    } finally {
      setSavingLoading(false);
    }
  }

  return (
    <Link
      href={href}
      className={cn(
        "group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#0F7B5A]/20 transition-all overflow-hidden",
        className
      )}
    >
      {/* Photo */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <Building2 className="w-12 h-12 text-gray-300" />
          </div>
        )}

        {/* Verified badge */}
        <div className="absolute top-3 left-3">
          {listing.isVerified ? (
            <span className="inline-flex items-center gap-1 bg-[#0F7B5A] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              <CheckCircle className="w-3.5 h-3.5" />
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-gray-700/70 text-white text-xs font-medium px-2.5 py-1 rounded-full">
              Unverified
            </span>
          )}
        </div>

        {/* Save button */}
        {isAuthenticated && (
          <button
            onClick={handleSave}
            disabled={savingLoading}
            className={cn(
              "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all",
              saved ? "bg-red-500 text-white" : "bg-white/90 text-gray-600 hover:bg-white hover:text-red-500"
            )}
            aria-label={saved ? "Unsave listing" : "Save listing"}
          >
            <Heart className={cn("w-4 h-4", saved && "fill-current")} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Property type + bedrooms */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
            {PROPERTY_TYPE_ICONS[listing.propertyType]}
            {PROPERTY_TYPE_LABELS[listing.propertyType] ?? listing.propertyType}
          </span>
          <span className="inline-flex items-center gap-1">
            <Bed className="w-3.5 h-3.5" />
            {listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms} bed`}
          </span>
          <span className="inline-flex items-center gap-1">
            <Bath className="w-3.5 h-3.5" />
            {listing.bathrooms} bath
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-2 group-hover:text-[#0F7B5A] transition-colors">
          {listing.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="line-clamp-1">
            {listing.area}, {listing.lga}, {listing.state}
          </span>
        </div>

        {/* Price */}
        <div className="mb-3">
          <span className="text-lg font-bold text-gray-900">{formatNaira(listing.annualRent)}</span>
          <span className="text-xs text-gray-500 ml-1">{FREQ_LABELS[primaryFreq] ?? "p.a."}</span>
        </div>

        {/* Owner */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <span className="text-xs text-gray-600 font-medium">{ownerName}</span>
          {badgeTier !== "NONE" && (
            <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", BADGE_TIER_COLORS[badgeTier])}>
              {badgeTier === "CERTIFIED" ? "★ Certified" : badgeTier === "PROPERTY_VERIFIED" ? "✓ Verified" : "ID Verified"}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
