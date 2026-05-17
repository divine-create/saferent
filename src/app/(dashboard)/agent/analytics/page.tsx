"use client";

import { BarChart2, TrendingUp, Clock, DollarSign, Users } from "lucide-react";

const PIPELINE_FUNNEL = [
  { stage: "New Enquiries", count: 24, pct: 100 },
  { stage: "Viewing Booked", count: 14, pct: 58 },
  { stage: "Offer Made", count: 8, pct: 33 },
  { stage: "Let Agreed", count: 5, pct: 21 },
];

const COMMISSION_TREND = [
  { month: "Dec 25", amount: 120000 },
  { month: "Jan 26", amount: 180000 },
  { month: "Feb 26", amount: 90000 },
  { month: "Mar 26", amount: 220000 },
  { month: "Apr 26", amount: 150000 },
  { month: "May 26", amount: 340000 },
];

const CLIENT_ACTIVITY = [
  { name: "Heritage Estates Ltd", listings: 8, lets: 5 },
  { name: "Emeka Nwosu", listings: 3, lets: 2 },
  { name: "Adunola Properties", listings: 2, lets: 1 },
  { name: "Folake Adeyemi", listings: 1, lets: 1 },
];

const RESPONSE_RATE = [
  { bucket: "< 2 hours", count: 18, pct: 60 },
  { bucket: "2-24 hours", count: 9, pct: 30 },
  { bucket: "> 24 hours", count: 3, pct: 10 },
];

const TIME_TO_LET = [
  { type: "Flat", avg: 14 },
  { type: "Self-contained", avg: 9 },
  { type: "Duplex", avg: 21 },
  { type: "Bungalow", avg: 18 },
];

function formatNaira(n: number) {
  if (n >= 1000000) return `₦${(n / 1000000).toFixed(1)}M`;
  return `₦${(n / 1000).toFixed(0)}K`;
}

export default function AgentAnalyticsPage() {
  const maxCommission = Math.max(...COMMISSION_TREND.map((m) => m.amount));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-[#0F7B5A]" />
          Agent Analytics
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Your pipeline, commissions, and performance metrics</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Pipeline Value", value: "₦24M", icon: <TrendingUp className="w-4 h-4 text-[#0F7B5A]" />, bg: "bg-green-50" },
          { label: "YTD Commissions", value: "₦1.1M", icon: <DollarSign className="w-4 h-4 text-[#D4A017]" />, bg: "bg-yellow-50" },
          { label: "Avg Days to Let", value: "14", icon: <Clock className="w-4 h-4 text-blue-600" />, bg: "bg-blue-50" },
          { label: "Active Clients", value: "4", icon: <Users className="w-4 h-4 text-purple-600" />, bg: "bg-purple-50" },
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

      {/* Pipeline funnel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <h2 className="font-semibold text-gray-800 mb-1 text-sm">Pipeline Funnel</h2>
        <p className="text-xs text-gray-400 mb-5">Enquiry to let agreed conversion</p>
        <div className="space-y-3">
          {PIPELINE_FUNNEL.map((stage, i) => (
            <div key={stage.stage} className="flex items-center gap-4">
              <span className="text-xs text-gray-500 w-28 shrink-0">{stage.stage}</span>
              <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                <div
                  className="h-full rounded-lg flex items-center justify-end pr-3 transition-all"
                  style={{
                    width: `${stage.pct}%`,
                    background: i === 0 ? "#0F7B5A" : i === 1 ? "#2d8a6a" : i === 2 ? "#4a9b7c" : "#68ac8e",
                  }}
                >
                  <span className="text-xs font-bold text-white">{stage.count}</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-gray-600 w-10 text-right">{stage.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Commission trend */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-1 text-sm">Commission Trend</h2>
          <p className="text-xs text-gray-400 mb-4">Monthly earnings (last 6 months)</p>
          <div className="space-y-1.5">
            {COMMISSION_TREND.map((m) => (
              <div key={m.month} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-12 shrink-0">{m.month}</span>
                <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#D4A017] rounded-full" style={{ width: `${(m.amount / maxCommission) * 100}%` }} />
                </div>
                <span className="text-xs font-medium text-gray-700 w-16 text-right">{formatNaira(m.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Response rate */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-1 text-sm">Response Rate</h2>
          <p className="text-xs text-gray-400 mb-4">Enquiry-to-reply time distribution</p>
          <div className="space-y-3">
            {RESPONSE_RATE.map((item) => (
              <div key={item.bucket}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">{item.bucket}</span>
                  <span className="text-xs font-semibold text-gray-700">{item.count} ({item.pct}%)</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${item.pct}%`,
                      background: item.bucket === "< 2 hours" ? "#0F7B5A" : item.bucket === "2-24 hours" ? "#D4A017" : "#ef4444",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">90% of replies within 24 hours</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Time to let */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-1 text-sm flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#0F7B5A]" />
            Average Time to Let
          </h2>
          <p className="text-xs text-gray-400 mb-4">Days from listing to let agreed, by property type</p>
          <div className="space-y-2">
            {TIME_TO_LET.map((item) => (
              <div key={item.type} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-24 shrink-0">{item.type}</span>
                <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(item.avg / 30) * 100}%` }} />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-12 text-right">{item.avg} days</span>
              </div>
            ))}
          </div>
        </div>

        {/* Client activity */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-1 text-sm flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#0F7B5A]" />
            Landlord Clients
          </h2>
          <p className="text-xs text-gray-400 mb-4">Ranked by completed lets</p>
          <div className="space-y-2">
            {CLIENT_ACTIVITY.map((client, i) => (
              <div key={client.name} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                <div className="w-6 h-6 rounded-full bg-[#0F7B5A]/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[#0F7B5A]">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-800">{client.name}</p>
                  <p className="text-xs text-gray-400">{client.listings} listings · {client.lets} lets completed</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
