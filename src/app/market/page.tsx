"use client";

import Link from "next/link";
import { useState } from "react";
import { Shield, TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

const RENT_INDEX = [
  { area: "Lekki Phase 1", state: "Lagos", bed1: 1800000, bed2: 3200000, bed3: 5500000, trend: 8, dir: "up" },
  { area: "Ikeja GRA", state: "Lagos", bed1: 1200000, bed2: 2400000, bed3: 4000000, trend: 5, dir: "up" },
  { area: "Victoria Island", state: "Lagos", bed1: 2500000, bed2: 4500000, bed3: 8000000, trend: 12, dir: "up" },
  { area: "Surulere", state: "Lagos", bed1: 600000, bed2: 1100000, bed3: 1800000, trend: 2, dir: "flat" },
  { area: "Yaba", state: "Lagos", bed1: 500000, bed2: 900000, bed3: 1500000, trend: 4, dir: "up" },
  { area: "Ikoyi", state: "Lagos", bed1: 3000000, bed2: 5500000, bed3: 9500000, trend: 15, dir: "up" },
  { area: "Maitama", state: "Abuja", bed1: 2000000, bed2: 3800000, bed3: 6500000, trend: 6, dir: "up" },
  { area: "Wuse 2", state: "Abuja", bed1: 1500000, bed2: 2800000, bed3: 4500000, trend: 4, dir: "up" },
];

const PROPERTY_TYPES = [
  { type: "Flat", pct: 42 },
  { type: "Self-contained", pct: 28 },
  { type: "Duplex", pct: 15 },
  { type: "Bungalow", pct: 8 },
  { type: "Other", pct: 7 },
];

const TYPE_COLORS = ["bg-[#0F7B5A]", "bg-[#D4A017]", "bg-blue-500", "bg-purple-500", "bg-gray-400"];

const STATS = [
  { value: "2,847", label: "Verified listings" },
  { value: "₦4.2B", label: "In escrow processed" },
  { value: "1,203", label: "Completed transactions" },
  { value: "4.8★", label: "Average landlord rating" },
];

const RENT_ESTIMATES: Record<string, Record<number, { low: number; high: number }>> = {
  "Lekki Phase 1": { 1: { low: 1500000, high: 2200000 }, 2: { low: 2800000, high: 3800000 }, 3: { low: 4800000, high: 6500000 } },
  "Ikeja GRA": { 1: { low: 1000000, high: 1500000 }, 2: { low: 2000000, high: 2900000 }, 3: { low: 3500000, high: 4800000 } },
  "Victoria Island": { 1: { low: 2200000, high: 3200000 }, 2: { low: 4000000, high: 5500000 }, 3: { low: 7000000, high: 9500000 } },
  "Surulere": { 1: { low: 500000, high: 800000 }, 2: { low: 900000, high: 1400000 }, 3: { low: 1500000, high: 2200000 } },
  "Yaba": { 1: { low: 400000, high: 650000 }, 2: { low: 750000, high: 1100000 }, 3: { low: 1200000, high: 1800000 } },
  "Ikoyi": { 1: { low: 2500000, high: 3800000 }, 2: { low: 4800000, high: 6500000 }, 3: { low: 8000000, high: 11500000 } },
  "Maitama": { 1: { low: 1700000, high: 2500000 }, 2: { low: 3200000, high: 4500000 }, 3: { low: 5500000, high: 7800000 } },
  "Wuse 2": { 1: { low: 1200000, high: 1900000 }, 2: { low: 2400000, high: 3400000 }, 3: { low: 3800000, high: 5500000 } },
};

function formatNaira(n: number) {
  if (n >= 1000000) return `₦${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `₦${(n / 1000).toFixed(0)}K`;
  return `₦${n}`;
}

function TrendIndicator({ dir, pct }: { dir: string; pct: number }) {
  if (dir === "up") return (
    <span className="flex items-center gap-0.5 text-green-600 font-medium text-xs">
      <TrendingUp className="w-3.5 h-3.5" /> +{pct}%
    </span>
  );
  if (dir === "down") return (
    <span className="flex items-center gap-0.5 text-red-600 font-medium text-xs">
      <TrendingDown className="w-3.5 h-3.5" /> -{pct}%
    </span>
  );
  return (
    <span className="flex items-center gap-0.5 text-gray-500 font-medium text-xs">
      <Minus className="w-3.5 h-3.5" /> {pct}%
    </span>
  );
}

export default function MarketDataPage() {
  const [estimatorArea, setEstimatorArea] = useState("Lekki Phase 1");
  const [estimatorBeds, setEstimatorBeds] = useState<1 | 2 | 3>(2);

  const estimate = RENT_ESTIMATES[estimatorArea]?.[estimatorBeds];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0F7B5A] rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SafeRent</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <Link href="/listings" className="hover:text-[#0F7B5A] transition-colors">Listings</Link>
            <Link href="/market" className="text-[#0F7B5A] font-semibold">Market Data</Link>
            <Link href="/diaspora" className="hover:text-[#0F7B5A] transition-colors">Diaspora</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-[#0F7B5A]">Sign In</Link>
            <Link href="/register" className="bg-[#0F7B5A] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#0a6049]">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            <TrendingUp className="w-4 h-4" />
            Updated May 2026
          </div>
          <h1 className="text-4xl font-extrabold mb-3">Nigeria Rental Market — Live Data</h1>
          <p className="text-gray-300 text-lg max-w-2xl">Rental price indices, market trends, and platform statistics for Nigeria&apos;s top cities.</p>
        </div>
      </section>

      {/* Platform stats bar */}
      <section className="bg-[#0F7B5A] py-5 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-extrabold text-white">{stat.value}</p>
              <p className="text-green-200 text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rent index table */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Rent Index by Area</h2>
          <p className="text-gray-500 mb-6">Median annual rents for Lagos and Abuja (May 2026)</p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Area</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">State</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">1-Bed</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">2-Bed</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">3-Bed</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">YoY Trend</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {RENT_INDEX.map((row) => (
                    <tr key={row.area} className="border-t border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-semibold text-gray-800">{row.area}</td>
                      <td className="px-4 py-3 text-gray-500">{row.state}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{formatNaira(row.bed1)}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{formatNaira(row.bed2)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatNaira(row.bed3)}</td>
                      <td className="px-4 py-3 text-right">
                        <TrendIndicator dir={row.dir} pct={row.trend} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/listings?area=${encodeURIComponent(row.area)}`}
                          className="text-xs text-[#0F7B5A] font-medium hover:underline"
                        >
                          See listings
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Property type breakdown + rent estimator */}
      <section className="py-8 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Property type */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Property Type Breakdown</h2>
            <p className="text-gray-500 text-sm mb-5">Share of listing types on SafeRent</p>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              {PROPERTY_TYPES.map((item, i) => (
                <div key={item.type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{item.type}</span>
                    <span className="text-sm font-semibold text-gray-800">{item.pct}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${TYPE_COLORS[i]} rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rent estimator */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Get a Rent Estimate</h2>
            <p className="text-gray-500 text-sm mb-5">Based on recent verified listings</p>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="space-y-4 mb-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Area</label>
                  <select
                    value={estimatorArea}
                    onChange={(e) => setEstimatorArea(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]"
                  >
                    {RENT_INDEX.map((r) => (
                      <option key={r.area} value={r.area}>{r.area}, {r.state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bedrooms</label>
                  <div className="flex gap-2">
                    {([1, 2, 3] as (1 | 2 | 3)[]).map((b) => (
                      <button
                        key={b}
                        onClick={() => setEstimatorBeds(b)}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-xl border transition-colors ${
                          estimatorBeds === b
                            ? "bg-[#0F7B5A] text-white border-[#0F7B5A]"
                            : "bg-white text-gray-700 border-gray-200 hover:border-[#0F7B5A]"
                        }`}
                      >
                        {b} Bed
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {estimate && (
                <div className="bg-[#0F7B5A]/5 border border-[#0F7B5A]/20 rounded-xl p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-1">Estimated range for {estimatorBeds}-bed in {estimatorArea}</p>
                  <p className="text-xl font-bold text-[#0F7B5A]">
                    {formatNaira(estimate.low)} – {formatNaira(estimate.high)}
                    <span className="text-sm font-normal text-gray-500 ml-1">per annum</span>
                  </p>
                </div>
              )}

              <Link
                href={`/listings?area=${encodeURIComponent(estimatorArea)}&bedrooms=${estimatorBeds}`}
                className="flex items-center justify-center gap-2 w-full bg-[#0F7B5A] text-white font-medium py-2.5 rounded-xl hover:bg-[#0a6049] transition-colors text-sm"
              >
                See available listings in {estimatorArea}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer note */}
      <section className="py-8 px-4 text-center">
        <p className="text-xs text-gray-400 max-w-xl mx-auto">
          Data based on listings and completed transactions on SafeRent as of May 2026. Figures are approximate and may vary based on specific property features. For investment decisions, consult a qualified estate surveyor.
        </p>
      </section>
    </div>
  );
}
