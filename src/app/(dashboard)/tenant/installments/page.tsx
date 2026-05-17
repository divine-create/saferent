import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreditCard, CheckCircle, Clock, AlertCircle, TrendingDown } from "lucide-react";
import { formatKoboToNaira } from "@/lib/utils";

// Mock installment plan data
const mockPlan = {
  id: "mock_plan_1",
  transactionId: "mock_tx_1",
  totalAmount: "450000000",
  monthlyAmount: "39375000",
  interestRate: 0.21,
  totalInterest: "94500000",
  totalRepayable: "544500000",
  debitDay: 1,
  startDate: "2026-02-01T00:00:00.000Z",
  status: "active",
  missedPayments: 0,
  property: "Spacious 3-Bedroom Flat in Lekki Phase 1",
  nextDueDate: "2026-06-01T00:00:00.000Z",
  paidCount: 4,
};

const mockInstallments = Array.from({ length: 12 }, (_, i) => {
  const date = new Date("2026-02-01");
  date.setMonth(date.getMonth() + i);
  const isPaid = i < 4;
  return {
    id: `mock_inst_${i + 1}`,
    installmentNumber: i + 1,
    dueDate: date.toISOString(),
    amount: "45375000", // includes interest
    paidAt: isPaid ? new Date(date.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString() : null,
    paidAmount: isPaid ? "45375000" : null,
    status: isPaid ? "PAID" : i === 4 ? "PENDING" : "PENDING",
    reference: isPaid ? `SR-2026-INST-${String(i + 1).padStart(3, "0")}` : null,
  };
});

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  PAID: { label: "Paid", bg: "bg-green-100", color: "text-green-700", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  PENDING: { label: "Pending", bg: "bg-yellow-100", color: "text-yellow-700", icon: <Clock className="w-3.5 h-3.5" /> },
  OVERDUE: { label: "Overdue", bg: "bg-red-100", color: "text-red-700", icon: <AlertCircle className="w-3.5 h-3.5" /> },
  FAILED: { label: "Failed", bg: "bg-red-100", color: "text-red-700", icon: <AlertCircle className="w-3.5 h-3.5" /> },
};

export default async function TenantInstallmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "TENANT") redirect("/login");

  const plan = mockPlan;
  const installments = mockInstallments;
  const paidCount = installments.filter((i) => i.status === "PAID").length;
  const remainingCount = installments.length - paidCount;
  const remainingAmount = BigInt(plan.totalRepayable) - BigInt(plan.totalAmount);
  const interestSaving = (BigInt(plan.totalInterest) * BigInt(remainingCount)) / BigInt(12);
  const earlyRepayAmount = (BigInt(plan.totalRepayable) * BigInt(remainingCount)) / BigInt(12) - interestSaving;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SafeRent Flex</h1>
        <p className="text-gray-500 mt-1 text-sm">Your monthly installment plan</p>
      </div>

      {/* Active Plan Card */}
      <div className="bg-gradient-to-br from-[#0F7B5A] to-[#0a6049] rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <CreditCard className="w-4 h-4 text-green-200" />
              <span className="text-green-200 text-sm font-medium">Active Plan</span>
            </div>
            <h2 className="text-lg font-bold">{plan.property}</h2>
            <p className="text-green-200 text-sm mt-1">21% p.a. interest rate</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-extrabold">{formatKoboToNaira(BigInt(plan.monthlyAmount))}</p>
            <p className="text-green-200 text-xs">per month</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-green-200 mb-2">
            <span>{paidCount} of 12 paid</span>
            <span>{remainingCount} remaining</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all"
              style={{ width: `${(paidCount / 12) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
          <div>
            <p className="text-green-300 text-xs">Total Fronted</p>
            <p className="font-semibold text-sm">{formatKoboToNaira(BigInt(plan.totalAmount))}</p>
          </div>
          <div>
            <p className="text-green-300 text-xs">Total Interest</p>
            <p className="font-semibold text-sm">{formatKoboToNaira(BigInt(plan.totalInterest))}</p>
          </div>
          <div>
            <p className="text-green-300 text-xs">Next Due</p>
            <p className="font-semibold text-sm">
              {new Date(plan.nextDueDate).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
            </p>
          </div>
        </div>
      </div>

      {/* Early Repayment Calculator */}
      <div className="bg-white rounded-xl border border-green-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-4 h-4 text-green-600" />
          <h2 className="font-semibold text-gray-900">Early Repayment</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Remaining Balance</p>
            <p className="font-bold text-gray-900 text-sm mt-0.5">
              {formatKoboToNaira((BigInt(plan.monthlyAmount) * BigInt(remainingCount)))}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Interest Saved</p>
            <p className="font-bold text-green-700 text-sm mt-0.5">{formatKoboToNaira(interestSaving)}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Pay Off Now</p>
            <p className="font-bold text-blue-700 text-sm mt-0.5">{formatKoboToNaira(earlyRepayAmount > 0 ? earlyRepayAmount : BigInt(0))}</p>
          </div>
        </div>
        <button className="w-full border border-[#0F7B5A] text-[#0F7B5A] text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-green-50 transition-colors">
          Pay Off Remaining Balance
        </button>
      </div>

      {/* Installments Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Payment Schedule</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-100">
                <th className="text-left pb-2 font-medium">#</th>
                <th className="text-left pb-2 font-medium">Due Date</th>
                <th className="text-right pb-2 font-medium">Amount</th>
                <th className="text-center pb-2 font-medium">Status</th>
                <th className="text-right pb-2 font-medium">Paid Date</th>
                <th className="text-right pb-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {installments.map((inst) => {
                const cfg = STATUS_CONFIG[inst.status] ?? STATUS_CONFIG.PENDING;
                const isNext = inst.status === "PENDING" && !installments.slice(0, inst.installmentNumber - 1).some((i) => i.status === "PENDING");
                return (
                  <tr key={inst.id} className={isNext ? "bg-yellow-50/50" : ""}>
                    <td className="py-2.5 text-gray-500 font-mono">{inst.installmentNumber}</td>
                    <td className="py-2.5 text-gray-700">
                      {new Date(inst.dueDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-2.5 text-right font-medium">{formatKoboToNaira(BigInt(inst.amount))}</td>
                    <td className="py-2.5 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-xs text-gray-500">
                      {inst.paidAt
                        ? new Date(inst.paidAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })
                        : "—"}
                    </td>
                    <td className="py-2.5 text-right">
                      {inst.status === "PENDING" && isNext && (
                        <button className="bg-[#0F7B5A] text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-[#0a6049] transition-colors">
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
