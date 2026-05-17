"use client";

import { BarChart2, TrendingUp, Users, Home, DollarSign } from "lucide-react";

const OCCUPANCY_TREND = [
  { month: "Jun 25", rate: 75 },
  { month: "Jul 25", rate: 75 },
  { month: "Aug 25", rate: 100 },
  { month: "Sep 25", rate: 100 },
  { month: "Oct 25", rate: 100 },
  { month: "Nov 25", rate: 100 },
  { month: "Dec 25", rate: 75 },
  { month: "Jan 26", rate: 100 },
  { month: "Feb 26", rate: 100 },
  { month: "Mar 26", rate: 100 },
  { month: "Apr 26", rate: 100 },
  { month: "May 26", rate: 100 },
];

const LISTING_PERFORMANCE = [
  { title: "3-Bed Flat, Lekki Phase 1", views: 142, enquiries: 18, viewings: 6, conversion: 33, daysToLet: 12, avgTrustScore: 82 },
  { title: "2-Bed Flat, Surulere", views: 89, enquiries: 11, viewings: 4, conversion: 25, daysToLet: 21, avgTrustScore: 75 },
  { title: "Self-Contained, Yaba", views: 67, enquiries: 8, viewings: 3, conversion: 38, daysToLet: 9, avgTrustScore: 68 },
];

const TRUST_SCORE_DISTRIBUTION = [
  { range: "90-100", count: 2, pct: 22 },
  { range: "80-89", count: 3, pct: 33 },
  { range: "70-79", count: 2, pct: 22 },
  { range: "60-69", count: 1, pct: 11 },
  { range: "Below 60", count: 1, pct: 11 },
];

const REVENUE_BY_PROPERTY = [
  { property: "3-Bed Flat, Lekki", revenue: 4500000, pct: 100 },
  { property: "2-Bed Flat, Surulere", revenue: 2400000, pct: 53 },
  { property: "Self-Contained, Yaba", revenue: 1200000, pct: 27 },
];

function formatNaira(n: number) {
  if (n >= 1000000) return `₦${(n / 1000000).toFixed(1)}M`;
  return `₦${(n / 1000).toFixed(0)}K`;
}

export default function LandlordAnalyticsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-[#0F7B5A]" />
          Portfolio Analytics
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Performance insights across all your properties</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Listings", value: "3", icon: <Home className="w-4 h-4 text-[#0F7B5A]" />, bg: "bg-green-50" },
          { label: "YTD Revenue", value: "₦8.1M", icon: <DollarSign className="w-4 h-4 text-[#D4A017]" />, bg: "bg-yellow-50" },
          { label: "Avg Occupancy", value: "94%", icon: <TrendingUp className="w-4 h-4 text-blue-600" />, bg: "bg-blue-50" },
          { label: "Renewal Rate", value: "67%", icon: <Users className="w-4 h-4 text-purple-600" />, bg: "bg-purple-50" },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className={`w-8 h-8 ${card.bg} rounded-lg flex items-center justify-center mb-2`}>
              {card.icon}
            </div>
            <p className="text-xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Occupancy trend */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-1 text-sm">Occupancy Rate Trend</h2>
          <p className="text-xs text-gray-400 mb-4">Last 12 months</p>
          <div className="space-y-1.5">
            {OCCUPANCY_TREND.map((m) => (
              <div key={m.month} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-12 shrink-0">{m.month}</span>
                <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0F7B5A] rounded-full" style={{ width: `${m.rate}%` }} />
                </div>
                <span className="text-xs font-medium text-gray-600 w-8 text-right">{m.rate}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue per property */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-1 text-sm">Revenue per Property</h2>
          <p className="text-xs text-gray-400 mb-4">Annual rent collected</p>
          <div className="space-y-3">
            {REVENUE_BY_PROPERTY.map((item) => (
              <div key={item.property}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-700 truncate max-w-[180px]">{item.property}</span>
                  <span className="text-xs font-semibold text-gray-800">{formatNaira(item.revenue)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#D4A017] rounded-full" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Listing performance table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm">Listing Performance</h2>
          <p className="text-xs text-gray-400">Per-listing stats and conversion metrics</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                {["Listing", "Views", "Enquiries", "Viewings", "Conversion", "Days to Let", "Avg Trust Score"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LISTING_PERFORMANCE.map((row) => (
                <tr key={row.title} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-[160px] truncate">{row.title}</td>
                  <td className="px-4 py-3 text-gray-600">{row.views}</td>
                  <td className="px-4 py-3 text-gray-600">{row.enquiries}</td>
                  <td className="px-4 py-3 text-gray-600">{row.viewings}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-[#0F7B5A]">{row.conversion}%</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.daysToLet} days</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">{row.avgTrustScore}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tenant quality + renewal rate */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-1 text-sm">Applicant Trust Score Distribution</h2>
          <p className="text-xs text-gray-400 mb-4">Quality of applicants across all listings</p>
          <div className="space-y-2">
            {TRUST_SCORE_DISTRIBUTION.map((item) => (
              <div key={item.range} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-20 shrink-0">{item.range}</span>
                <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.pct}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-6 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-1 text-sm">Renewal Rate</h2>
          <p className="text-xs text-gray-400 mb-4">Tenant retention insights</p>
          <div className="flex gap-8 justify-center mt-4">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full border-8 border-[#0F7B5A] flex items-center justify-center mb-2">
                <span className="text-2xl font-extrabold text-[#0F7B5A]">67%</span>
              </div>
              <p className="text-xs text-gray-500">Renewed</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 rounded-full border-8 border-gray-200 flex items-center justify-center mb-2">
                <span className="text-2xl font-extrabold text-gray-500">33%</span>
              </div>
              <p className="text-xs text-gray-500">Vacated</p>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-400 text-center">
            Based on 3 completed tenancies
          </div>
        </div>
      </div>
    </div>
  );
}
