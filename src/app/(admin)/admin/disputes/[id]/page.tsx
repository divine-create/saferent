import { requireAdmin } from "@/lib/admin-auth";
import { mockOpenDisputes } from "@/lib/mock-admin";
import { Badge } from "@/components/ui/Badge";
import { formatKoboToNaira } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, User, Building2, FileText, Clock } from "lucide-react";
import { DisputeResolutionPanel } from "@/components/admin/DisputeResolutionPanel";

interface PageProps {
  params: Promise<{ id: string }>;
}

function SlaInfo({ deadline, label }: { deadline: Date | null; label: string }) {
  if (!deadline) return null;
  const ms = deadline.getTime() - Date.now();
  const h = Math.floor(Math.abs(ms) / 3600000);
  const color = ms < 0 ? "bg-red-100 text-red-700" : ms < 8 * 3600000 ? "bg-red-50 text-red-600" : ms < 24 * 3600000 ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700";
  const text = ms < 0 ? `${h}h overdue` : h < 24 ? `${h}h remaining` : `${Math.floor(h / 24)}d remaining`;
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${color}`}>
      <Clock className="w-4 h-4" />
      {label}: {text}
    </div>
  );
}

export default async function AdminDisputeDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const dispute = mockOpenDisputes.find((d) => d.id === id) ?? mockOpenDisputes[0];

  const statusBadgeMap: Record<string, string> = {
    OPEN: "warning",
    EVIDENCE_COLLECTION: "info",
    MEDIATION: "gold",
    ADJUDICATION: "error",
    RESOLVED: "verified",
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back */}
      <Link href="/admin/disputes" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Disputes
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-sm text-gray-500">{dispute.transaction.reference}</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                {dispute.category.replace(/_/g, " ")}
              </span>
              <Badge variant={(statusBadgeMap[dispute.status] ?? "default") as never}>
                {dispute.status.replace(/_/g, " ")}
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{dispute.description.slice(0, 80)}…</h1>
            <p className="text-sm text-gray-500 mt-1">
              Raised {new Date(dispute.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* SLA */}
        <div className="flex gap-3 mt-4 flex-wrap">
          {(dispute.status as string) === "OPEN" && <SlaInfo deadline={dispute.evidenceDeadline} label="Evidence deadline" />}
          {(dispute.status as string) === "EVIDENCE_COLLECTION" && <SlaInfo deadline={dispute.mediationDeadline} label="Mediation deadline" />}
          {((dispute.status as string) === "MEDIATION" || (dispute.status as string) === "ADJUDICATION") && (
            <SlaInfo deadline={(dispute as { adjudicationDeadline: Date | null }).adjudicationDeadline} label="Decision deadline" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Parties */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Parties</h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Tenant */}
              <div className="border border-blue-100 bg-blue-50 rounded-lg p-4">
                <p className="text-xs font-medium text-blue-600 mb-2">TENANT (Raised dispute)</p>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {dispute.transaction.tenant.firstName} {dispute.transaction.tenant.lastName}
                    </p>
                    <p className="text-xs text-gray-500">Trust score: {dispute.raisedBy.trustScore ?? 75}</p>
                  </div>
                </div>
                <Link href={`/admin/users/${dispute.raisedBy.id}`} className="text-xs text-blue-600 hover:underline mt-2 inline-block">
                  View profile →
                </Link>
              </div>

              {/* Landlord */}
              <div className="border border-purple-100 bg-purple-50 rounded-lg p-4">
                <p className="text-xs font-medium text-purple-600 mb-2">LANDLORD</p>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {dispute.transaction.landlord.firstName} {dispute.transaction.landlord.lastName}
                    </p>
                    <p className="text-xs text-gray-500">Badge: ID Verified</p>
                  </div>
                </div>
                <Link href={`/admin/users/${dispute.transaction.landlord.id ?? "usr_002"}`} className="text-xs text-purple-600 hover:underline mt-2 inline-block">
                  View profile →
                </Link>
              </div>
            </div>
          </div>

          {/* Property */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">Property</h2>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{dispute.transaction.listing.address}</p>
                <p className="text-sm text-gray-500">
                  Rent: {formatKoboToNaira(dispute.transaction.rentAmount)}
                  {" · "}
                  Total: {formatKoboToNaira(dispute.transaction.totalAmount)}
                </p>
              </div>
              <Link
                href={`/admin/listings/${dispute.transaction.listing.id ?? "lst_001"}`}
                className="text-xs text-[#0F7B5A] hover:underline flex-shrink-0"
              >
                View listing
              </Link>
            </div>
          </div>

          {/* Evidence */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Evidence</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-blue-700 mb-2">Tenant Evidence</h3>
                <p className="text-sm text-gray-600 mb-3">{dispute.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border border-dashed border-gray-200">
                      <FileText className="w-6 h-6 text-gray-300" />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-purple-700 mb-2">Landlord Evidence</h3>
                <p className="text-sm text-gray-400 italic mb-3">No evidence submitted yet</p>
                <div className="aspect-video bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-200">
                  <p className="text-xs text-gray-400">Pending submission</p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform evidence */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">Platform Evidence (Auto-included)</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className="text-gray-500">Viewing record:</span>
                <span className="text-gray-700">Viewing confirmed on {new Date(dispute.createdAt.getTime() - 7 * 24 * 3600000).toLocaleDateString("en-NG")}</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className="text-gray-500">Move-in record:</span>
                <span className="text-gray-700">Move-in confirmed via GPS — tenant checked in</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className="text-gray-500">Messages:</span>
                <span className="text-gray-700">14 messages exchanged before dispute</span>
              </div>
            </div>
          </div>
        </div>

        {/* Resolution panel */}
        <div>
          <DisputeResolutionPanel
            disputeId={dispute.id}
            status={dispute.status}
            rentAmount={Number(dispute.transaction.rentAmount)}
          />
        </div>
      </div>
    </div>
  );
}
