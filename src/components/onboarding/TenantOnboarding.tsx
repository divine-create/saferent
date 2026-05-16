"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, Upload, Briefcase, CheckCircle, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StepIndicator } from "@/components/ui/StepIndicator";

const STEPS = [
  { label: "Welcome", description: "Get started" },
  { label: "BVN", description: "Identity verification" },
  { label: "ID Upload", description: "Document proof" },
  { label: "Employment", description: "Income details" },
  { label: "Complete", description: "You're all set" },
];

type IdType = "NATIONAL_ID" | "VOTERS_CARD" | "PASSPORT" | "DRIVERS_LICENCE";
type EmploymentStatus = "EMPLOYED" | "SELF_EMPLOYED" | "STUDENT" | "OTHER";

export function TenantOnboarding() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [bvn, setBvn] = useState("");
  const [bvnError, setBvnError] = useState("");
  const [bvnLoading, setBvnLoading] = useState(false);
  const [bvnSubmitted, setBvnSubmitted] = useState(false);
  const [idType, setIdType] = useState<IdType>("NATIONAL_ID");
  const [employment, setEmployment] = useState<EmploymentStatus>("EMPLOYED");
  const [employerName, setEmployerName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleBvnSubmit = async () => {
    if (!/^\d{11}$/.test(bvn)) {
      setBvnError("BVN must be exactly 11 digits");
      return;
    }
    setBvnError("");
    setBvnLoading(true);
    // Mock BVN verification — in production, call identity provider API
    await new Promise((r) => setTimeout(r, 1800));
    setBvnLoading(false);
    setBvnSubmitted(true);
  };

  const handleComplete = async () => {
    setSaving(true);
    await fetch("/api/onboarding/tenant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idType, employment, employerName }),
    });
    await update();
    setSaving(false);
    router.push("/tenant");
  };

  return (
    <div>
      <StepIndicator steps={STEPS} currentStep={step} />
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mt-6">

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Shield className="w-8 h-8 text-[#0F7B5A]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to SafeRent</h2>
            <p className="text-gray-500 mb-6">
              Let&apos;s set up your tenant profile. This takes about 3 minutes and builds the trust score that unlocks
              full access to the platform — including escrow payments and viewing bookings.
            </p>
            <div className="text-left space-y-3 bg-gray-50 rounded-xl p-4 mb-7 text-sm text-gray-600">
              {[
                "BVN verification — your identity, securely confirmed",
                "Government ID upload — matches your BVN record",
                "Employment details — helps landlords assess applications",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#0F7B5A] mt-0.5 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <Button className="w-full" onClick={() => setStep(1)} rightIcon={<ChevronRight className="w-4 h-4" />}>
              Get Started
            </Button>
          </div>
        )}

        {/* Step 1: BVN */}
        {step === 1 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#0F7B5A]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">BVN Verification</h2>
                <p className="text-sm text-gray-500">We&apos;ll verify your identity with your bank</p>
              </div>
            </div>
            {!bvnSubmitted ? (
              <>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700 mb-5">
                  Your BVN is never stored in plaintext — it is hashed and used only for identity matching.
                  Dial <strong>*565*0#</strong> on your registered phone to retrieve your BVN.
                </div>
                <Input
                  label="Bank Verification Number (BVN)"
                  placeholder="Enter your 11-digit BVN"
                  value={bvn}
                  onChange={(e) => setBvn(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  error={bvnError}
                  inputMode="numeric"
                />
                <Button
                  className="w-full mt-4"
                  onClick={handleBvnSubmit}
                  isLoading={bvnLoading}
                  disabled={bvn.length !== 11}
                >
                  Verify BVN
                </Button>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-7 h-7 text-[#0F7B5A]" />
                </div>
                <p className="font-semibold text-gray-900">BVN submitted for verification</p>
                <p className="text-sm text-gray-500 mt-1">You&apos;ll receive a notification once your BVN is confirmed — usually within a few seconds.</p>
                <Button className="w-full mt-5" onClick={() => setStep(2)}>
                  Continue
                </Button>
              </div>
            )}
            <button onClick={() => setStep(0)} className="mt-4 text-sm text-gray-400 hover:text-gray-600 w-full text-center">
              ← Back
            </button>
          </div>
        )}

        {/* Step 2: ID Upload */}
        {step === 2 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">ID Document</h2>
                <p className="text-sm text-gray-500">Upload a valid government-issued ID</p>
              </div>
            </div>
            <div className="space-y-3 mb-5">
              {(["NATIONAL_ID", "VOTERS_CARD", "PASSPORT", "DRIVERS_LICENCE"] as IdType[]).map((t) => (
                <label key={t} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${idType === t ? "border-[#0F7B5A] bg-green-50" : "border-gray-100 hover:border-gray-200"}`}>
                  <input type="radio" name="idType" value={t} checked={idType === t} onChange={() => setIdType(t)} className="sr-only" />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${idType === t ? "border-[#0F7B5A]" : "border-gray-300"}`}>
                    {idType === t && <div className="w-2 h-2 rounded-full bg-[#0F7B5A]" />}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {t === "NATIONAL_ID" && "National ID Card"}
                    {t === "VOTERS_CARD" && "Voter's Card"}
                    {t === "PASSPORT" && "International Passport"}
                    {t === "DRIVERS_LICENCE" && "Driver's Licence"}
                  </span>
                </label>
              ))}
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#0F7B5A] transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG or PDF — max 5MB</p>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">We also require a quick selfie to match against your ID. You&apos;ll be prompted after upload.</p>
            <Button className="w-full mt-5" onClick={() => setStep(3)}>
              Continue <ChevronRight className="w-4 h-4 ml-1 inline" />
            </Button>
            <button onClick={() => setStep(1)} className="mt-3 text-sm text-gray-400 hover:text-gray-600 w-full text-center">← Back</button>
          </div>
        )}

        {/* Step 3: Employment */}
        {step === 3 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Employment Details</h2>
                <p className="text-sm text-gray-500">Helps landlords assess your application</p>
              </div>
            </div>
            <div className="space-y-3 mb-5">
              {([
                { value: "EMPLOYED", label: "Employed", sub: "Work for a company or organisation" },
                { value: "SELF_EMPLOYED", label: "Self-employed / Business owner", sub: "Run your own business or freelance" },
                { value: "STUDENT", label: "Student", sub: "Full-time student with bank statement" },
                { value: "OTHER", label: "Other", sub: "Retired, dependent, or other income source" },
              ] as { value: EmploymentStatus; label: string; sub: string }[]).map((opt) => (
                <label key={opt.value} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${employment === opt.value ? "border-[#0F7B5A] bg-green-50" : "border-gray-100 hover:border-gray-200"}`}>
                  <input type="radio" name="employment" value={opt.value} checked={employment === opt.value} onChange={() => setEmployment(opt.value)} className="sr-only" />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 ${employment === opt.value ? "border-[#0F7B5A]" : "border-gray-300"}`}>
                    {employment === opt.value && <div className="w-2 h-2 rounded-full bg-[#0F7B5A]" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{opt.label}</p>
                    <p className="text-xs text-gray-400">{opt.sub}</p>
                  </div>
                </label>
              ))}
            </div>
            {employment === "EMPLOYED" && (
              <Input
                label="Employer Name"
                placeholder="e.g. Access Bank PLC"
                value={employerName}
                onChange={(e) => setEmployerName(e.target.value)}
              />
            )}
            <Button className="w-full mt-5" onClick={() => setStep(4)}>Continue <ChevronRight className="w-4 h-4 ml-1 inline" /></Button>
            <button onClick={() => setStep(2)} className="mt-3 text-sm text-gray-400 hover:text-gray-600 w-full text-center">← Back</button>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 4 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-[#0F7B5A]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">You&apos;re all set!</h2>
            <p className="text-gray-500 mb-6">Your verification documents have been submitted. You&apos;ll receive a notification once review is complete (usually within 24 hours).</p>
            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 text-sm mb-6">
              <p className="font-semibold text-gray-700 mb-2">What happens next:</p>
              {[
                "Our team reviews your ID and BVN match",
                "Your trust score updates automatically",
                "You unlock full access to listings and viewings",
                "BVN approval unlocks escrow payments",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-gray-600">
                  <CheckCircle className="w-4 h-4 text-[#0F7B5A] mt-0.5 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <Button className="w-full" onClick={handleComplete} isLoading={saving}>
              {saving ? "Saving..." : "Go to My Dashboard"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
