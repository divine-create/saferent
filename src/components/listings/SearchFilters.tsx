"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const STATES_LGAS: Record<string, string[]> = {
  Lagos: [
    "Ikeja", "Lekki", "Victoria Island", "Ikoyi", "Surulere", "Yaba",
    "Ajah", "Eti-Osa", "Alimosho", "Isale-Eko", "Kosofe", "Mushin",
    "Ojo", "Amuwo-Odofin", "Lagos Island", "Lagos Mainland",
  ],
  "Abuja FCT": [
    "Municipal Area Council", "Garki", "Wuse", "Maitama", "Asokoro",
    "Gwarinpa", "Kubwa", "Karu", "Bwari", "Gwagwalada",
  ],
  Ogun: ["Abeokuta North", "Abeokuta South", "Ijebu Ode", "Sagamu", "Ota", "Ifo"],
  Rivers: ["Port Harcourt", "Obio-Akpor", "Okrika", "Eleme", "Bonny", "Tai"],
  Kano: ["Kano Municipal", "Fagge", "Dala", "Gwale", "Nasarawa", "Ungogo"],
};

const PROPERTY_TYPES = [
  { value: "FLAT", label: "Flat" },
  { value: "SELF_CONTAINED", label: "Self-contained" },
  { value: "DUPLEX", label: "Duplex" },
  { value: "BUNGALOW", label: "Bungalow" },
  { value: "TERRACED_HOUSE", label: "Terraced House" },
  { value: "DETACHED_HOUSE", label: "Detached House" },
  { value: "ROOM_AND_PARLOUR", label: "Room & Parlour" },
  { value: "STUDIO", label: "Studio" },
];

const AMENITIES = [
  "Generator", "Borehole", "Prepaid Meter", "Central AC",
  "Fitted Kitchen", "BQ (Boys Quarter)", "Security", "Swimming Pool",
  "Gym", "Parking", "Elevator", "Pet-friendly",
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "most_viewed", label: "Most Viewed" },
];

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showFilters, setShowFilters] = useState(false);

  // Current filter values
  const q = searchParams.get("q") ?? "";
  const state = searchParams.get("state") ?? "";
  const lga = searchParams.get("lga") ?? "";
  const selectedTypes = (searchParams.get("propertyType") ?? "").split(",").filter(Boolean);
  const minBedrooms = searchParams.get("minBedrooms") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const furnishing = searchParams.get("furnishing") ?? "";
  const letType = searchParams.get("letType") ?? "";
  const selectedAmenities = (searchParams.get("amenities") ?? "").split(",").filter(Boolean);
  const isVerified = searchParams.get("isVerified") ?? "";
  const sort = searchParams.get("sort") ?? "newest";

  const [localQ, setLocalQ] = useState(q);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    params.delete("page"); // reset page on filter change
    startTransition(() => router.push(`/listings?${params.toString()}`));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ q: localQ || null });
  }

  function toggleType(type: string) {
    const current = (searchParams.get("propertyType") ?? "").split(",").filter(Boolean);
    const next = current.includes(type) ? current.filter((t) => t !== type) : [...current, type];
    updateParams({ propertyType: next.join(",") || null });
  }

  function toggleAmenity(amenity: string) {
    const current = (searchParams.get("amenities") ?? "").split(",").filter(Boolean);
    const next = current.includes(amenity) ? current.filter((a) => a !== amenity) : [...current, amenity];
    updateParams({ amenities: next.join(",") || null });
  }

  // Count active filters (excluding sort and q)
  const activeFilterCount = [
    state, lga,
    searchParams.get("propertyType"),
    minBedrooms,
    minPrice, maxPrice,
    furnishing, letType,
    searchParams.get("amenities"),
    isVerified,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search bar + sort */}
      <div className="flex gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            placeholder="Search by area, LGA, or keyword..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A]"
          />
        </form>
        <select
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A] bg-white"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors",
            showFilters || activeFilterCount > 0
              ? "border-[#0F7B5A] bg-[#0F7B5A] text-white"
              : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50"
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-white text-[#0F7B5A] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
          {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Active filter tags */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {state && (
            <FilterTag label={state} onRemove={() => updateParams({ state: null, lga: null })} />
          )}
          {lga && <FilterTag label={lga} onRemove={() => updateParams({ lga: null })} />}
          {selectedTypes.map((t) => (
            <FilterTag key={t} label={PROPERTY_TYPES.find((p) => p.value === t)?.label ?? t} onRemove={() => toggleType(t)} />
          ))}
          {minBedrooms && <FilterTag label={`${minBedrooms}+ beds`} onRemove={() => updateParams({ minBedrooms: null })} />}
          {furnishing && <FilterTag label={furnishing.replace("_", " ")} onRemove={() => updateParams({ furnishing: null })} />}
          {letType && <FilterTag label={letType.replace("_", " ")} onRemove={() => updateParams({ letType: null })} />}
          {isVerified && <FilterTag label="Verified only" onRemove={() => updateParams({ isVerified: null })} />}
          {selectedAmenities.map((a) => (
            <FilterTag key={a} label={a} onRemove={() => toggleAmenity(a)} />
          ))}
          <button
            onClick={() => {
              setLocalQ("");
              startTransition(() => router.push("/listings"));
            }}
            className="text-xs text-red-500 hover:text-red-600 font-medium underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* State */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">State</label>
              <select
                value={state}
                onChange={(e) => updateParams({ state: e.target.value || null, lga: null })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A] bg-white"
              >
                <option value="">All States</option>
                {Object.keys(STATES_LGAS).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* LGA */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">LGA / Area</label>
              <select
                value={lga}
                onChange={(e) => updateParams({ lga: e.target.value || null })}
                disabled={!state}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A] bg-white disabled:opacity-50"
              >
                <option value="">All LGAs</option>
                {(STATES_LGAS[state] ?? []).map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Let type */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Let Type</label>
              <div className="flex gap-2">
                {[
                  { value: "", label: "All" },
                  { value: "LONG_LET", label: "Long Let" },
                  { value: "SHORT_LET", label: "Short Let" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateParams({ letType: opt.value || null })}
                    className={cn(
                      "flex-1 py-2 text-sm font-medium rounded-lg border transition-colors",
                      letType === opt.value
                        ? "bg-[#0F7B5A] text-white border-[#0F7B5A]"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Property types */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Property Type</label>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((pt) => (
                <button
                  key={pt.value}
                  onClick={() => toggleType(pt.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    selectedTypes.includes(pt.value)
                      ? "bg-[#0F7B5A] text-white border-[#0F7B5A]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#0F7B5A]/50"
                  )}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Min Bedrooms</label>
            <div className="flex gap-2">
              {["", "1", "2", "3", "4", "5"].map((num) => (
                <button
                  key={num}
                  onClick={() => updateParams({ minBedrooms: num || null })}
                  className={cn(
                    "w-10 h-10 rounded-lg text-sm font-medium border transition-colors",
                    minBedrooms === num
                      ? "bg-[#0F7B5A] text-white border-[#0F7B5A]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#0F7B5A]/50"
                  )}
                >
                  {num === "" ? "Any" : num === "5" ? "5+" : num}
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Min Price (₦ p.a.)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₦</span>
                <input
                  type="number"
                  defaultValue={minPrice}
                  placeholder="0"
                  onBlur={(e) => updateParams({ minPrice: e.target.value || null })}
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Max Price (₦ p.a.)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₦</span>
                <input
                  type="number"
                  defaultValue={maxPrice}
                  placeholder="Unlimited"
                  onBlur={(e) => updateParams({ maxPrice: e.target.value || null })}
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A]"
                />
              </div>
            </div>
          </div>

          {/* Furnishing */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Furnishing</label>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: "", label: "Any" },
                { value: "UNFURNISHED", label: "Unfurnished" },
                { value: "SEMI_FURNISHED", label: "Semi-furnished" },
                { value: "FULLY_FURNISHED", label: "Fully Furnished" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateParams({ furnishing: opt.value || null })}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    furnishing === opt.value
                      ? "bg-[#0F7B5A] text-white border-[#0F7B5A]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#0F7B5A]/50"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Amenities</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {AMENITIES.map((amenity) => (
                <label key={amenity} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                    className="w-4 h-4 rounded border-gray-300 text-[#0F7B5A] focus:ring-[#0F7B5A] accent-[#0F7B5A]"
                  />
                  <span className="text-xs text-gray-600 group-hover:text-gray-900">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Verified only */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-700">Verified listings only</p>
              <p className="text-xs text-gray-500">Show only SafeRent verified properties</p>
            </div>
            <button
              role="switch"
              aria-checked={isVerified === "true"}
              onClick={() => updateParams({ isVerified: isVerified === "true" ? null : "true" })}
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors focus:outline-none",
                isVerified === "true" ? "bg-[#0F7B5A]" : "bg-gray-200"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                  isVerified === "true" ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isPending && (
        <div className="text-xs text-[#0F7B5A] animate-pulse">Updating results...</div>
      )}
    </div>
  );
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-[#0F7B5A]/10 text-[#0F7B5A] text-xs font-medium px-3 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-red-500 transition-colors">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
