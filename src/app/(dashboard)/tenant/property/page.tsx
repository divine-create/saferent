import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Wrench,
  CreditCard,
  Calendar,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  RefreshCw,
} from "lucide-react";
import { formatKoboToNaira } from "@/lib/utils";
import {
  mockTenancies,
  mockMaintenanceRequests,
  mockRentPayments,
  mockLeaseRenewal,
  MOCK_TENANT_ID,
} from "@/lib/mock-property";

const STATUS_COLORS: Record<string, { label: string; bg: string; color: string }> = {
  SUBMITTED: { label: "Submitted", bg: "bg-blue-100", color: "text-blue-700" },
  ACKNOWLEDGED: { label: "Acknowledged", bg: "bg-yellow-100", color: "text-yellow-700" },
  IN_PROGRESS: { label: "In Progress", bg: "bg-purple-100", color: "text-purple-700" },
  RESOLVED: { label: "Resolved", bg: "bg-green-100", color: "text-green-700" },
  DECLINED: { label: "Declined", bg: "bg-red-100", color: "text-red-700" },
};

const URGENCY_COLORS: Record<string, { label: string; bg: string; color: string }> = {
  low: { label: "Low", bg: "bg-gray-100", color: "text-gray-600" },
  normal: { label: "Normal", bg: "bg-blue-100", color: "text-blue-700" },
  urgent: { label: "Urgent", bg: "bg-red-100", color: "text-red-700" },
};

export default async function TenantPropertyPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "TENANT") redirect("/login");

  // Use mock data (falls back from DB)
  const tenancy = mockTenancies.find((t) => t.tenantId === MOCK_TENANT_ID) ?? mockTenancies[0];
  const maintenance = mockMaintenanceRequests;
  const rentPayments = mockRentPayments;
  const renewal = mockLeaseRenewal;

  const startDate = new Date(tenancy.tenancyStartDate!);
  const endDate = new Date(tenancy.tenancyEndDate!);
  const today = new Date("2026-05-16");
  const daysToRenewal = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const upcomingPayment = rentPayments.find((p) => p.status === "pending");
  const daysToDue = upcomingPayment
    ? Math.ceil((new Date(upcomingPayment.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Property</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage your active tenancy</p>
      </div>

      {/* Active Tenancy Card */}
      <div className="bg-gradient-to-br from-[#0F7B5A] to-[#0a6049] rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Home className="w-4 h-4 text-green-200" />
              <span className="text-green-200 text-sm font-medium">Active Tenancy</span>
            </div>
            <h2 className="text-lg font-bold">{tenancy.listing.title}</h2>
            <p className="text-green-200 text-sm mt-1">{tenancy.listing.address}</p>
            <p className="text-green-100 text-xs mt-1">
              Landlord: {tenancy.landlord.firstName} {tenancy.landlord.lastName}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-extrabold">{formatKoboToNaira(BigInt(tenancy.rentAmount))}</p>
            <p className="text-green-200 text-xs">per year</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-white/20">
          <div>
            <p className="text-green-300 text-xs">Lease Start</p>
            <p className="font-semibold text-sm">{startDate.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</p>
          </div>
          <div>
            <p className="text-green-300 text-xs">Lease End</p>
            <p className="font-semibold text-sm">{endDate.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</p>
          </div>
          <div>
            <p className="text-green-300 text-xs">Days to Renewal</p>
            <p className="font-semibold text-sm">{daysToRenewal} days</p>
          </div>
        </div>
      </div>

      {/* Rent Tracker */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#0F7B5A]" />
            Rent Tracker
          </h2>
        </div>

        {upcomingPayment && (
          <div className={`rounded-lg p-4 mb-4 ${daysToDue !== null && daysToDue <= 7 ? "bg-red-50 border border-red-200" : "bg-amber-50 border border-amber-200"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-semibold text-sm ${daysToDue !== null && daysToDue <= 7 ? "text-red-800" : "text-amber-800"}`}>
                  {daysToDue !== null && daysToDue <= 0 ? "Overdue!" : `Due in ${daysToDue} days`}
                </p>
                <p className={`text-xs mt-0.5 ${daysToDue !== null && daysToDue <= 7 ? "text-red-600" : "text-amber-600"}`}>
                  {formatKoboToNaira(BigInt(upcomingPayment.amount))} due {new Date(upcomingPayment.dueDate).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <button className="bg-[#0F7B5A] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#0a6049] transition-colors">
                Pay Now
              </button>
            </div>
          </div>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b border-gray-100">
              <th className="text-left pb-2">Due Date</th>
              <th className="text-right pb-2">Amount</th>
              <th className="text-right pb-2">Status</th>
              <th className="text-right pb-2">Paid Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rentPayments.map((p) => (
              <tr key={p.id} className="py-2">
                <td className="py-2 text-gray-700">
                  {new Date(p.dueDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="py-2 text-right font-medium">{formatKoboToNaira(BigInt(p.amount))}</td>
                <td className="py-2 text-right">
                  <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                    p.status === "paid" ? "bg-green-100 text-green-700" :
                    p.status === "overdue" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </span>
                </td>
                <td className="py-2 text-right text-gray-500 text-xs">
                  {p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" }) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Maintenance Requests */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-[#0F7B5A]" />
            Maintenance Requests
          </h2>
          <Link
            href="/tenant/property/maintenance/new"
            className="flex items-center gap-1.5 bg-[#0F7B5A] text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-[#0a6049] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Report Issue
          </Link>
        </div>

        <div className="space-y-3">
          {maintenance.map((req) => {
            const statusCfg = STATUS_COLORS[req.status] ?? { label: req.status, bg: "bg-gray-100", color: "text-gray-600" };
            const urgencyCfg = URGENCY_COLORS[req.urgency] ?? { label: req.urgency, bg: "bg-gray-100", color: "text-gray-600" };
            return (
              <div key={req.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${urgencyCfg.bg} ${urgencyCfg.color}`}>
                        {urgencyCfg.label}
                      </span>
                      <span className="text-xs text-gray-400 font-medium px-2 py-0.5 rounded-full bg-gray-50">
                        {req.category.replace("_", " ")}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{req.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{req.description.slice(0, 100)}...</p>
                    {req.landlordNotes && (
                      <p className="text-xs text-[#0F7B5A] mt-1.5 bg-green-50 px-2 py-1 rounded">
                        Landlord: {req.landlordNotes}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400">
                      {new Date(req.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                    </p>
                    {req.scheduledDate && (
                      <p className="text-xs text-purple-600 mt-1">
                        <Calendar className="w-3 h-3 inline" /> {new Date(req.scheduledDate).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                      </p>
                    )}
                  </div>
                </div>
                {req.status === "RESOLVED" && !req.tenantConfirmed && (
                  <button className="mt-2 text-xs text-[#0F7B5A] font-medium hover:underline flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Confirm resolved
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lease Renewal */}
      {renewal && (
        <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw className="w-4 h-4 text-amber-600" />
            <h2 className="text-base font-semibold text-gray-900">Lease Renewal</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
              {renewal.status === "negotiating" ? "Negotiating" : renewal.status.charAt(0).toUpperCase() + renewal.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Current Rent</p>
              <p className="font-bold text-gray-900">{formatKoboToNaira(BigInt(renewal.currentRent))}</p>
              <p className="text-xs text-gray-400">per year</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Proposed Rent</p>
              <p className="font-bold text-amber-800">{formatKoboToNaira(BigInt(renewal.proposedRent))}</p>
              <p className="text-xs text-amber-600">
                +{(((Number(renewal.proposedRent) - Number(renewal.currentRent)) / Number(renewal.currentRent)) * 100).toFixed(1)}% increase
              </p>
            </div>
          </div>

          {renewal.tenantCounter && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
              <p className="text-xs font-semibold text-blue-700 mb-1">Your counter-offer</p>
              <p className="font-bold text-blue-900">{formatKoboToNaira(BigInt(renewal.tenantCounter))}</p>
              {renewal.tenantResponse && <p className="text-xs text-blue-700 mt-1">{renewal.tenantResponse}</p>}
            </div>
          )}

          {renewal.landlordResponse && (
            <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-4">
              <p className="text-xs font-semibold text-green-700 mb-1">Landlord response</p>
              <p className="text-xs text-green-800">{renewal.landlordResponse}</p>
            </div>
          )}

          {renewal.status === "proposed" && (
            <div className="flex gap-3">
              <button className="flex-1 bg-[#0F7B5A] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#0a6049] transition-colors">
                Accept
              </button>
              <button className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                Counter Offer
              </button>
              <button className="flex-1 border border-red-200 text-red-600 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-red-50 transition-colors">
                Decline
              </button>
            </div>
          )}
          {renewal.status === "negotiating" && (
            <div className="flex gap-3">
              <button className="flex-1 bg-[#0F7B5A] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#0a6049] transition-colors flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Accept Current Terms
              </button>
              <button className="flex-1 border border-red-200 text-red-600 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Decline & Vacate
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/tenant/property/maintenance/new"
          className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-[#0F7B5A]/30 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Wrench className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Report Issue</p>
                <p className="text-gray-500 text-xs">Submit a new maintenance request</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#0F7B5A] transition-colors" />
          </div>
        </Link>
        <Link
          href="/tenant/installments"
          className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-[#0F7B5A]/30 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <Clock className="w-5 h-5 text-[#0F7B5A]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Installment Plan</p>
                <p className="text-gray-500 text-xs">SafeRent Flex monthly payments</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#0F7B5A] transition-colors" />
          </div>
        </Link>
      </div>
    </div>
  );
}
