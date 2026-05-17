import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Building,
  Wrench,
  Calendar,
  CreditCard,
  ChevronRight,
  AlertTriangle,
  Clock,
  CheckCircle,
  Plus,
} from "lucide-react";
import { formatKoboToNaira } from "@/lib/utils";
import {
  mockTenancies,
  mockMaintenanceRequests,
  mockRentPayments,
  MOCK_LANDLORD_ID,
} from "@/lib/mock-property";

const URGENCY_COLORS: Record<string, string> = {
  urgent: "text-red-700 bg-red-100",
  normal: "text-blue-700 bg-blue-100",
  low: "text-gray-700 bg-gray-100",
};

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "text-blue-700 bg-blue-100",
  ACKNOWLEDGED: "text-yellow-700 bg-yellow-100",
  IN_PROGRESS: "text-purple-700 bg-purple-100",
  RESOLVED: "text-green-700 bg-green-100",
  DECLINED: "text-red-700 bg-red-100",
};

export default async function LandlordPropertyPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "LANDLORD") redirect("/login");

  const tenancies = mockTenancies.filter((t) => t.landlordId === MOCK_LANDLORD_ID);
  const openMaintenance = mockMaintenanceRequests.filter((r) => r.status !== "RESOLVED" && r.status !== "DECLINED");
  const allMaintenance = mockMaintenanceRequests;
  const rentPayments = mockRentPayments;
  const overdue = rentPayments.filter((p) => p.status === "overdue");
  const upcoming = rentPayments.filter((p) => p.status === "pending");

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Property Management</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage your tenancies, maintenance, and rent collection</p>
      </div>

      {/* Portfolio Overview */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building className="w-4 h-4 text-[#0F7B5A]" />
          Active Tenancies
        </h2>
        <div className="space-y-3">
          {tenancies.map((t) => {
            const endDate = new Date(t.tenancyEndDate!);
            const today = new Date("2026-05-16");
            const daysToRenewal = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return (
              <Link
                key={t.id}
                href={`/landlord/property/${t.id}`}
                className="block bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-[#0F7B5A]/30 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{t.listing.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{t.listing.address}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Tenant: {t.tenant.firstName} {t.tenant.lastName}</span>
                      <span>Ref: {t.reference}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900">{formatKoboToNaira(BigInt(t.rentAmount))}</p>
                    <p className="text-xs text-gray-400">per year</p>
                    <p className={`text-xs font-medium mt-1 ${daysToRenewal < 90 ? "text-amber-600" : "text-gray-500"}`}>
                      {daysToRenewal} days to renewal
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>Start: {new Date(t.tenancyStartDate!).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
                    <span>End: {endDate.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#0F7B5A] font-medium">
                    Manage
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Maintenance Queue */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-[#0F7B5A]" />
          Maintenance Queue ({openMaintenance.length} open)
        </h2>
        {openMaintenance.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center shadow-sm">
            <CheckCircle className="w-8 h-8 text-green-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No open maintenance requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {openMaintenance.map((req) => (
              <div key={req.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${URGENCY_COLORS[req.urgency] ?? "text-gray-700 bg-gray-100"}`}>
                        {req.urgency.charAt(0).toUpperCase() + req.urgency.slice(1)}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[req.status] ?? "text-gray-700 bg-gray-100"}`}>
                        {req.status.replace("_", " ")}
                      </span>
                      <span className="text-xs text-gray-500">{req.category.replace("_", " ")}</span>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{req.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{req.description.slice(0, 80)}...</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Submitted {new Date(req.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {req.status === "SUBMITTED" && (
                      <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                        Acknowledge
                      </button>
                    )}
                    {(req.status === "ACKNOWLEDGED") && (
                      <button className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition-colors">
                        Schedule Fix
                      </button>
                    )}
                    {req.status !== "RESOLVED" && req.status !== "DECLINED" && (
                      <button className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inspection Scheduler */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0F7B5A]" />
            Schedule Inspection
          </h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          You must give at least 24 hours notice before a mid-tenancy inspection.
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Property</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30">
              {tenancies.map((t) => (
                <option key={t.id} value={t.id}>{t.listing.area}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Inspection Date</label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30"
              min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
            />
          </div>
          <div className="flex items-end">
            <button className="w-full flex items-center justify-center gap-2 bg-[#0F7B5A] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#0a6049] transition-colors">
              <Plus className="w-4 h-4" />
              Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Rent Tracker */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[#0F7B5A]" />
          Rent Collection
        </h2>
        {overdue.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <p className="text-sm text-red-700">
              <span className="font-semibold">{overdue.length} overdue payment{overdue.length > 1 ? "s" : ""}</span> — contact tenant
            </p>
          </div>
        )}
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b border-gray-100">
              <th className="text-left pb-2 font-medium">Property</th>
              <th className="text-left pb-2 font-medium">Due Date</th>
              <th className="text-right pb-2 font-medium">Amount</th>
              <th className="text-right pb-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rentPayments.map((p) => {
              const tenancy = tenancies.find((t) => t.id === p.tenancyId);
              return (
                <tr key={p.id}>
                  <td className="py-2.5 text-gray-700 text-xs">{tenancy?.listing.area ?? "—"}</td>
                  <td className="py-2.5 text-gray-700">
                    {new Date(p.dueDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="py-2.5 text-right font-medium">{formatKoboToNaira(BigInt(p.amount))}</td>
                  <td className="py-2.5 text-right">
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                      p.status === "paid" ? "bg-green-100 text-green-700" :
                      p.status === "overdue" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
