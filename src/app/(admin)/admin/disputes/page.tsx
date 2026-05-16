import { requireAdmin } from "@/lib/admin-auth";
import { mockOpenDisputes } from "@/lib/mock-admin";
import { Badge } from "@/components/ui/Badge";
import { formatKoboToNaira } from "@/lib/utils";
import Link from "next/link";
import { Download } from "lucide-react";

const TABS = ["OPEN", "EVIDENCE_COLLECTION", "MEDIATION", "ADJUDICATION", "RESOLVED"] as const;
type Tab = (typeof TABS)[number] | "ALL";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

function SlaCountdown({ deadline, label }: { deadline: Date | null; label: string }) {
  if (!deadline) return <span className="text-gray-400 text-xs">—</span>;
  const ms = deadline.getTime() - Date.now();
  const h = Math.floor(Math.abs(ms) / 3600000);
  const color = ms < 0 ? "text-red-600 font-semibold" : ms < 8 * 3600000 ? "text-red-500" : ms < 24 * 3600000 ? "text-yellow-600" : "text-green-600";
  const text = ms < 0 ? `${h}h overdue` : h < 24 ? `${h}h` : `${Math.floor(h / 24)}d`;
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-xs ${color}`}>{text}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    OPEN: "warning",
    EVIDENCE_COLLECTION: "info",
    MEDIATION: "gold",
    ADJUDICATION: "error",
    RESOLVED: "verified",
  };
  return <Badge variant={(map[status] ?? "default") as never}>{status.replace(/_/g, " ")}</Badge>;
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
      {category.replace(/_/g, " ")}
    </span>
  );
}

export default async function AdminDisputesPage({ searchParams }: PageProps) {
  await requireAdmin();
  const sp = await searchParams;
  const tab = (sp.tab ?? "OPEN") as Tab;

  const disputes = tab === "ALL"
    ? mockOpenDisputes
    : mockOpenDisputes.filter((d) => d.status === tab);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Disputes</h1>
          <p className="text-gray-500 text-sm mt-0.5">Dispute management and adjudication</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 overflow-x-auto">
        {TABS.map((t) => {
          const count = mockOpenDisputes.filter((d) => d.status === t).length;
          return (
            <Link
              key={t}
              href={`/admin/disputes?tab=${t}`}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
                tab === t
                  ? "border-[#0F7B5A] text-[#0F7B5A]"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              {t.replace(/_/g, " ")}
              {count > 0 && (
                <span className={`ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs ${tab === t ? "bg-[#0F7B5A] text-white" : "bg-gray-100 text-gray-600"}`}>
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {disputes.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No disputes in this status</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Reference</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Raised by</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Property</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">SLA</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((d) => (
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-gray-600">{d.transaction.reference}</p>
                      <p className="text-xs text-gray-400">{formatKoboToNaira(d.transaction.totalAmount)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <CategoryBadge category={d.category} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700 text-sm">{d.raisedBy.firstName} {d.raisedBy.lastName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700 text-sm truncate max-w-40">{d.transaction.listing.address}</p>
                    </td>
                    <td className="px-4 py-3">
                      {(d.status as string) === "OPEN" && <SlaCountdown deadline={d.evidenceDeadline} label="Evidence due" />}
                      {(d.status as string) === "EVIDENCE_COLLECTION" && <SlaCountdown deadline={d.mediationDeadline} label="Mediation due" />}
                      {(d.status as string) === "MEDIATION" && <SlaCountdown deadline={(d as unknown as { adjudicationDeadline: Date | null }).adjudicationDeadline} label="Decision due" />}
                      {(d.status as string) === "ADJUDICATION" && <SlaCountdown deadline={(d as unknown as { adjudicationDeadline: Date | null }).adjudicationDeadline} label="Final due" />}
                      {(d.status as string) === "RESOLVED" && <span className="text-xs text-gray-400">Resolved</span>}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/disputes/${d.id}`}
                        className="px-3 py-1.5 rounded border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
