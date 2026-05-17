import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Shield,
  Phone,
  Mail,
  FileText,
  Lock,
  CheckCircle,
  Clock,
  User,
  Camera,
} from "lucide-react";
import { TrustScoreCard } from "@/components/trust/TrustScoreCard";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { mockReviews } from "@/lib/reviews";

export default async function TenantProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "TENANT") redirect("/login");

  const trustScore = session.user.trustScore ?? 0;
  const band = trustScore >= 80 ? "excellent" : trustScore >= 60 ? "good" : trustScore >= 40 ? "fair" : "restricted";

  const mockBreakdown = {
    bvnVerified: session.user.bvnVerificationStatus === "VERIFIED" ? 20 : 0,
    ninVerified: 0,
    idDocumentVerified: 0,
    employmentVerified: 0,
    landlordReference: 0,
    rentalHistory: 0,
    zeroDisputes: 10,
    profileComplete: 6,
    total: trustScore,
  };

  const unlockedFeatures =
    band === "excellent"
      ? ["Installment payments (SafeRent Flex)", "Full platform access", "Escrow payments", "Priority support"]
      : band === "good"
      ? ["Full platform access", "Escrow payments", "Viewing bookings"]
      : ["Escrow payments (required)", "Viewing bookings"];

  const verifications = [
    {
      label: "BVN Verified",
      icon: <Shield className="w-4 h-4" />,
      status: session.user.bvnVerificationStatus,
      action: "Verify BVN",
      href: "/onboarding",
    },
    {
      label: "Phone Verified",
      icon: <Phone className="w-4 h-4" />,
      status: session.user.isPhoneVerified ? "VERIFIED" : "NOT_SUBMITTED",
      action: "Verify Phone",
      href: "/onboarding",
    },
    {
      label: "Email Verified",
      icon: <Mail className="w-4 h-4" />,
      status: session.user.isEmailVerified ? "VERIFIED" : "NOT_SUBMITTED",
      action: "Verify Email",
      href: "/onboarding",
    },
    {
      label: "ID Document",
      icon: <FileText className="w-4 h-4" />,
      status: "NOT_SUBMITTED",
      action: "Upload ID",
      href: "/onboarding",
    },
    {
      label: "Employment",
      icon: <FileText className="w-4 h-4" />,
      status: "NOT_SUBMITTED",
      action: "Upload payslip",
      href: "/onboarding",
    },
  ];

  const myReviews = mockReviews.filter((r) => r.revieweeId === "mock_tenant_1");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage your personal details and verifications</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Details */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Personal Details</h2>
              <button className="text-sm text-[#0F7B5A] font-medium hover:underline">Edit</button>
            </div>

            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-full bg-[#0F7B5A]/10 flex items-center justify-center relative">
                <span className="text-2xl font-bold text-[#0F7B5A]">
                  {session.user.name?.charAt(0)?.toUpperCase() ?? "U"}
                </span>
                <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50">
                  <Camera className="w-3 h-3 text-gray-600" />
                </button>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{session.user.name ?? "—"}</p>
                <p className="text-sm text-gray-500">{session.user.email ?? "—"}</p>
                <p className="text-sm text-gray-500">{session.user.phone ?? "—"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "First Name", value: session.user.name?.split(" ")[0] ?? "—" },
                { label: "Last Name", value: session.user.name?.split(" ").slice(1).join(" ") || "—" },
                { label: "Email", value: session.user.email ?? "—", locked: true },
                { label: "Phone", value: session.user.phone ?? "—" },
                { label: "Date of Birth", value: "—", locked: true },
              ].map((field) => (
                <div key={field.label}>
                  <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    {field.label}
                    {field.locked && <Lock className="w-3 h-3 text-gray-400" />}
                  </label>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{field.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Verifications */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Verification Status</h2>
            <div className="space-y-3">
              {verifications.map((v) => {
                const isVerified = v.status === "VERIFIED";
                const isPending = v.status === "PENDING";
                return (
                  <div key={v.label} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isVerified ? "bg-green-100 text-green-600" : isPending ? "bg-yellow-100 text-yellow-600" : "bg-gray-100 text-gray-400"}`}>
                        {v.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{v.label}</p>
                        <p className={`text-xs ${isVerified ? "text-green-600" : isPending ? "text-yellow-600" : "text-gray-400"}`}>
                          {isVerified ? "Verified" : isPending ? "Under review" : "Not submitted"}
                        </p>
                      </div>
                    </div>
                    {isVerified ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : isPending ? (
                      <Clock className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <a href={v.href} className="text-xs font-medium text-[#0F7B5A] hover:underline">
                        {v.action}
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews received */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[#0F7B5A]" />
              Reviews from Landlords
            </h2>
            {myReviews.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No reviews yet</p>
            ) : (
              <div className="space-y-3">
                {myReviews.map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </div>
            )}
          </div>

          {/* Document uploads */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Documents</h2>
            <div className="space-y-3">
              {[
                { name: "Government ID", uploaded: false },
                { name: "Bank Statement (3 months)", uploaded: false },
                { name: "Payslip (latest)", uploaded: false },
                { name: "Passport Photo", uploaded: false },
              ].map((doc) => (
                <div key={doc.name} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{doc.name}</span>
                  </div>
                  {doc.uploaded ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <button className="text-xs font-medium text-[#0F7B5A] hover:underline">Upload</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Score Card */}
        <div>
          <TrustScoreCard
            score={trustScore}
            breakdown={mockBreakdown}
            band={band as "excellent" | "good" | "fair" | "restricted"}
            unlockedFeatures={unlockedFeatures}
          />
        </div>
      </div>
    </div>
  );
}
