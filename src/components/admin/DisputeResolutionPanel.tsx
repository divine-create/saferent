"use client";

import { useState } from "react";
import { formatKoboToNaira } from "@/lib/utils";

interface Props {
  disputeId: string;
  status: string;
  rentAmount: number;
}

const OUTCOMES = [
  { key: "FULL_REFUND_TENANT", label: "Full refund to tenant" },
  { key: "PARTIAL_REFUND", label: "Partial refund" },
  { key: "FULL_RELEASE_LANDLORD", label: "Full release to landlord" },
  { key: "SPLIT", label: "Split" },
] as const;

export function DisputeResolutionPanel({ disputeId, status, rentAmount }: Props) {
  const [outcome, setOutcome] = useState<string>("");
  const [resolution, setResolution] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [tenantPct, setTenantPct] = useState("50");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const isAdjudication = status === "ADJUDICATION";

  async function handleAdvance() {
    setLoading(true);
    try {
      await fetch(`/api/admin/disputes/${disputeId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "advance_stage" }),
      });
      setToast("Dispute advanced to next stage");
    } catch {
      setToast("Error — please try again");
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  }

  async function handleResolve() {
    if (!outcome || !resolution.trim()) {
      setToast("Please select outcome and enter resolution notes");
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setLoading(true);
    try {
      await fetch(`/api/admin/disputes/${disputeId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resolve",
          outcome,
          resolution,
          refundAmount: refundAmount ? parseFloat(refundAmount) : undefined,
        }),
      });
      setToast("Dispute resolved successfully");
    } catch {
      setToast("Error — please try again");
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-6">
      <div className="p-5 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">Resolution Panel</h2>
        <p className="text-xs text-gray-400 mt-0.5">Current stage: {status.replace(/_/g, " ")}</p>
      </div>

      <div className="p-5 space-y-4">
        {/* Outcome selection */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Outcome</p>
          <div className="space-y-2">
            {OUTCOMES.map((o) => (
              <label
                key={o.key}
                className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  outcome === o.key
                    ? "border-[#0F7B5A] bg-[#0F7B5A]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="outcome"
                  value={o.key}
                  checked={outcome === o.key}
                  onChange={() => setOutcome(o.key)}
                  className="accent-[#0F7B5A]"
                />
                <span className="text-sm text-gray-700">{o.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Conditional inputs */}
        {outcome === "PARTIAL_REFUND" && (
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Refund amount (₦)
            </label>
            <input
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              placeholder={`Max: ${(rentAmount / 100).toFixed(0)}`}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30"
            />
            <p className="text-xs text-gray-400 mt-1">
              Total in escrow: {formatKoboToNaira(BigInt(rentAmount))}
            </p>
          </div>
        )}

        {outcome === "SPLIT" && (
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Tenant share: {tenantPct}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={tenantPct}
              onChange={(e) => setTenantPct(e.target.value)}
              className="w-full accent-[#0F7B5A]"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Tenant: {tenantPct}%</span>
              <span>Landlord: {100 - parseInt(tenantPct)}%</span>
            </div>
          </div>
        )}

        {/* Resolution notes */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Resolution notes <span className="text-red-500">*</span>
          </label>
          <textarea
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            rows={4}
            placeholder="Document your reasoning for this decision…"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="space-y-2 pt-1">
          {status !== "RESOLVED" && status !== "ADJUDICATION" && (
            <button
              onClick={handleAdvance}
              disabled={loading}
              className="w-full py-2.5 rounded-lg border border-[#0F7B5A] text-[#0F7B5A] text-sm font-medium hover:bg-[#0F7B5A]/5 transition-colors disabled:opacity-50"
            >
              Advance to next stage
            </button>
          )}
          {isAdjudication && (
            <button
              onClick={handleResolve}
              disabled={loading || !outcome || !resolution.trim()}
              className="w-full py-2.5 rounded-lg bg-[#0F7B5A] text-white text-sm font-medium hover:bg-[#0a6049] transition-colors disabled:opacity-50"
            >
              Make Decision
            </button>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div className="px-3 py-2 rounded-lg bg-gray-900 text-white text-xs text-center">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
