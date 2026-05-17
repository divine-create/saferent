"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, Building2, Users, TrendingUp, Download, Upload, Plus, Search, X } from "lucide-react";

const MOCK_UNITS = [
  { id: "u1", address: "Flat 3A, Heritage Court, Lekki", type: "FLAT", beds: 2, baths: 2, tenant: "Adebayo Okafor", rent: 2400000, serviceCharge: 120000, leaseStart: "2025-08-15", leaseExpiry: "2026-08-15", status: "OCCUPIED", paymentStatus: "ON_TIME" },
  { id: "u2", address: "Flat 5B, Heritage Court, Lekki", type: "FLAT", beds: 2, baths: 2, tenant: null, rent: 2400000, serviceCharge: 120000, leaseStart: null, leaseExpiry: null, status: "VACANT", paymentStatus: null },
  { id: "u3", address: "Unit 12, Sunset Estate, VI", type: "FLAT", beds: 3, baths: 3, tenant: "Chidi Eze", rent: 4500000, serviceCharge: 200000, leaseStart: "2025-07-01", leaseExpiry: "2026-07-01", status: "OCCUPIED", paymentStatus: "ON_TIME" },
  { id: "u4", address: "Unit 8, Sunset Estate, VI", type: "FLAT", beds: 3, baths: 3, tenant: "Folake Adeyemi", rent: 4500000, serviceCharge: 200000, leaseStart: "2025-06-15", leaseExpiry: "2026-06-15", status: "EXPIRING", paymentStatus: "LATE" },
  { id: "u5", address: "Unit 2, Greenfield Towers, Ikoyi", type: "FLAT", beds: 4, baths: 3, tenant: "Emeka Nwosu", rent: 8000000, serviceCharge: 350000, leaseStart: "2025-09-30", leaseExpiry: "2026-09-30", status: "OCCUPIED", paymentStatus: "ON_TIME" },
  { id: "u6", address: "Unit 7, Greenfield Towers, Ikoyi", type: "FLAT", beds: 4, baths: 3, tenant: null, rent: 8000000, serviceCharge: 350000, leaseStart: null, leaseExpiry: null, status: "VACANT", paymentStatus: null },
  { id: "u7", address: "Block B Apt 1, Palm Court, Abuja", type: "FLAT", beds: 3, baths: 2, tenant: "Ngozi Obi", rent: 5000000, serviceCharge: 250000, leaseStart: "2025-11-01", leaseExpiry: "2026-11-01", status: "OCCUPIED", paymentStatus: "ON_TIME" },
  { id: "u8", address: "Block B Apt 2, Palm Court, Abuja", type: "FLAT", beds: 3, baths: 2, tenant: null, rent: 5000000, serviceCharge: 250000, leaseStart: null, leaseExpiry: null, status: "VACANT", paymentStatus: null },
  { id: "u9", address: "Studio A, Heritage Court, Lekki", type: "STUDIO", beds: 0, baths: 1, tenant: "Kemi Balogun", rent: 1200000, serviceCharge: 60000, leaseStart: "2025-10-01", leaseExpiry: "2026-10-01", status: "OCCUPIED", paymentStatus: "ON_TIME" },
  { id: "u10", address: "Studio B, Heritage Court, Lekki", type: "STUDIO", beds: 0, baths: 1, tenant: null, rent: 1200000, serviceCharge: 60000, leaseStart: null, leaseExpiry: null, status: "VACANT", paymentStatus: null },
];

type Filter = "ALL" | "OCCUPIED" | "VACANT" | "EXPIRING";

const STATUS_COLORS: Record<string, string> = {
  OCCUPIED: "bg-green-100 text-green-800",
  VACANT: "bg-gray-100 text-gray-600",
  EXPIRING: "bg-yellow-100 text-yellow-700",
};

function formatNaira(n: number) {
  if (n >= 1000000) return `₦${(n / 1000000).toFixed(1)}M`;
  return `₦${(n / 1000).toFixed(0)}K`;
}

export default function DeveloperUnitsPage() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);

  const filtered = MOCK_UNITS.filter((u) => {
    const matchesFilter = filter === "ALL" || u.status === filter;
    const matchesSearch = !search || u.address.toLowerCase().includes(search.toLowerCase()) || (u.tenant?.toLowerCase().includes(search.toLowerCase()) ?? false);
    return matchesFilter && matchesSearch;
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selected.length === filtered.length) {
      setSelected([]);
    } else {
      setSelected(filtered.map((u) => u.id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#0F7B5A] rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">SafeRent</span>
          </Link>
          <div className="mt-1 text-xs text-gray-500 font-medium">Developer Portal</div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {[
            { href: "/developer", label: "Dashboard", icon: Building2 },
            { href: "/developer/units", label: "Units", icon: Building2, active: true },
            { href: "/developer/tenants", label: "Tenants", icon: Users },
            { href: "/developer/analytics", label: "Analytics", icon: TrendingUp },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                item.active ? "bg-[#0F7B5A]/10 text-[#0F7B5A] font-semibold" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <Link href="/landlord/listings/new" className="block text-xs text-center bg-[#0F7B5A] text-white rounded-lg py-2 font-medium hover:bg-[#0a6049] transition-colors">
            + Add Units
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Units</h1>
              <p className="text-gray-500 text-sm mt-0.5">{MOCK_UNITS.length} units across your portfolio</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-4 h-4" /> Import CSV
              </button>
              <button
                onClick={() => alert("CSV export triggered (mock)")}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
              <Link
                href="/landlord/listings/new"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[#0F7B5A] rounded-lg hover:bg-[#0a6049] transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Unit
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search units or tenants..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]"
              />
            </div>
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
              {(["ALL", "OCCUPIED", "VACANT", "EXPIRING"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    filter === f ? "bg-[#0F7B5A] text-white" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {f === "EXPIRING" ? "Expiring Soon" : f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Bulk actions */}
          {selected.length > 0 && (
            <div className="mb-3 bg-[#0F7B5A]/5 border border-[#0F7B5A]/20 rounded-xl px-4 py-2.5 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{selected.length} unit{selected.length > 1 ? "s" : ""} selected</span>
              <div className="flex gap-2">
                <button className="text-xs font-medium text-[#0F7B5A] hover:underline">Send renewal reminders</button>
                <span className="text-gray-300">|</span>
                <button className="text-xs font-medium text-[#0F7B5A] hover:underline">Update service charge</button>
                <span className="text-gray-300">|</span>
                <button className="text-xs font-medium text-[#0F7B5A] hover:underline">Export selected</button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={selected.length === filtered.length && filtered.length > 0}
                        onChange={toggleAll}
                        className="rounded"
                      />
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Unit Address</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Beds</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tenant</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rent p.a.</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Service Charge</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Lease Expiry</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((unit) => (
                    <tr key={unit.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(unit.id)}
                          onChange={() => toggleSelect(unit.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800 text-xs max-w-xs">{unit.address}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{unit.type}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{unit.beds === 0 ? "Studio" : unit.beds}</td>
                      <td className="px-4 py-3 text-gray-700 text-xs">
                        {unit.tenant ?? <span className="text-gray-400">Vacant</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-700 text-xs font-medium">{formatNaira(unit.rent)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatNaira(unit.serviceCharge)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{unit.leaseExpiry ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[unit.status]}`}>
                          {unit.status === "EXPIRING" ? "Expiring" : unit.status.charAt(0) + unit.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-400">No units match your filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Import CSV modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Import Units via CSV</h3>
              <button onClick={() => setShowImportModal(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Upload a CSV file with your unit data. Download the template to see the required format.
            </p>
            <button className="text-sm text-[#0F7B5A] font-medium hover:underline mb-4 flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> Download CSV template
            </button>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#0F7B5A] transition-colors cursor-pointer mb-4">
              <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Click to upload CSV</p>
              <p className="text-xs text-gray-400 mt-1">Max 10MB · CSV files only</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowImportModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button className="flex-1 px-4 py-2.5 bg-[#0F7B5A] text-white rounded-xl text-sm font-medium hover:bg-[#0a6049]">Import</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
