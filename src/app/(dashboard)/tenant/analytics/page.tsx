"use client";

import { BarChart2, Heart, MessageCircle, Calendar, MapPin, TrendingUp, DollarSign } from "lucide-react";

// Mock data
const ACTIVITY_LAST_30_DAYS = [
  { day: "May 1", views: 3, saves: 1, enquiries: 0, viewings: 0 },
  { day: "May 3", views: 5, saves: 2, enquiries: 1, viewings: 0 },
  { day: "May 5", views: 2, saves: 0, enquiries: 0, viewings: 0 },
  { day: "May 8", views: 7, saves: 2, enquiries: 1, viewings: 1 },
  { day: "May 10", views: 4, saves: 1, enquiries: 0, viewings: 0 },
  { day: "May 12", views: 6, saves: 3, enquiries: 2, viewings: 1 },
  { day: "May 15", views: 8, saves: 1, enquiries: 1, viewings: 0 },
  { day: "May 17", views: 3, saves: 0, enquiries: 0, viewings: 0 },
];

const TOP_AREAS = [
  { area: "Lagos Island", count: 12 },
  { area: "Lekki", count: 8 },
  { area: "Yaba", count: 6 },
  { area: "Surulere", count: 4 },
  { area: "Victoria Island", count: 3 },
];

const TRUST_SCORE_HISTORY = [
  { date: "Jan 2026", score: 20, event: "Account created" },
  { date: "Feb 2026", score: 40, event: "Email verified" },
  { date: "Mar 2026", score: 55, event: "Phone verified" },
  { date: "Apr 2026", score: 70, event: "BVN submitted" },
  { date: "May 2026", score: 85, event: "ID document verified" },
];

const SPENDING_SUMMARY = {
  totalEscrow: 2400000,
  feesPaid: 8000,
  installmentPayments: 200000,
  totalPaid: 2608000,
};

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

export default function TenantAnalyticsPage() {
  const maxViews = Math.max(...ACTIVITY_LAST_30_DAYS.map((d) => d.views));
  const maxArea = Math.max(...TOP_AREAS.map((a) => a.count));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-[#0F7B5A]" />
          My Analytics
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Your activity and progress on SafeRent</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Listings Viewed", value: "38", icon: <BarChart2 className="w-4 h-4 text-blue-600" />, bg: "bg-blue-50" },
          { label: "Listings Saved", value: "10", icon: <Heart className="w-4 h-4 text-red-500" />, bg: "bg-red-50" },
          { label: "Enquiries Sent", value: "5", icon: <MessageCircle className="w-4 h-4 text-[#0F7B5A]" />, bg: "bg-green-50" },
          { label: "Viewings Attended", value: "2", icon: <Calendar className="w-4 h-4 text-purple-600" />, bg: "bg-purple-50" },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className={`w-8 h-8 ${card.bg} rounded-lg flex items-center justify-center mb-2`}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Activity timeline */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-1 text-sm">Activity Timeline</h2>
          <p className="text-xs text-gray-400 mb-4">Listings viewed per day (last 30 days)</p>
          <div className="space-y-1.5">
            {ACTIVITY_LAST_30_DAYS.map((d) => (
              <div key={d.day} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-14 shrink-0">{d.day}</span>
                <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0F7B5A] rounded-full" style={{ width: `${(d.views / maxViews) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-4 text-right">{d.views}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top searched areas */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-1 text-sm flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#0F7B5A]" />
            Top Searched Areas
          </h2>
          <p className="text-xs text-gray-400 mb-4">Based on your browsing history</p>
          <div className="space-y-2">
            {TOP_AREAS.map((area) => (
              <div key={area.area} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-28 shrink-0">{area.area}</span>
                <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#D4A017] rounded-full" style={{ width: `${(area.count / maxArea) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-4 text-right">{area.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex gap-4 text-xs text-gray-500">
              <span>Preferred type: <strong className="text-gray-700">Flat</strong></span>
              <span>Price range: <strong className="text-gray-700">₦1M–₦3M</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Trust score history */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-1 text-sm flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#0F7B5A]" />
            Trust Score History
          </h2>
          <p className="text-xs text-gray-400 mb-4">How your trust score grew</p>
          <div className="space-y-2">
            {TRUST_SCORE_HISTORY.map((entry, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#0F7B5A] shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs text-gray-600">{entry.event}</span>
                    <span className="text-xs font-bold text-[#0F7B5A]">{entry.score}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0F7B5A] rounded-full" style={{ width: `${entry.score}%` }} />
                  </div>
                  <span className="text-xs text-gray-400">{entry.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spending summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-1 text-sm flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-[#0F7B5A]" />
            Spending Summary
          </h2>
          <p className="text-xs text-gray-400 mb-4">All-time payments on SafeRent</p>
          <div className="space-y-3">
            {[
              { label: "Escrow payments", amount: SPENDING_SUMMARY.totalEscrow },
              { label: "Legal fees", amount: SPENDING_SUMMARY.feesPaid },
              { label: "Installment payments", amount: SPENDING_SUMMARY.installmentPayments },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className="text-sm font-semibold text-gray-800">{formatNaira(item.amount)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-semibold text-gray-700">Total paid</span>
              <span className="text-base font-bold text-[#0F7B5A]">{formatNaira(SPENDING_SUMMARY.totalPaid)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
