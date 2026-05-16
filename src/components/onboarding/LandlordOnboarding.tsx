"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Upload, CheckCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StepIndicator } from "@/components/ui/StepIndicator";

const STEPS = [
  { label: "Welcome", description: "Get started" },
  { label: "BVN", description: "Identity check" },
  { label: "Documents", description: "Title documents" },
  { label: "Complete", description: "You're verified" },
];

export function LandlordOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [bvn, setBvn] = useState("");
  const [bvnError, setBvnError] = useState("");
  const [bvnLoading, setBvnLoading] = useState(false);
  const [bvnSubmitted, setBvnSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleBvnSubmit = async () => {
    if (!/^\d{11}$/.test(bvn)) { setBvnError("BVN must be 11 digits"); return; }
    setBvnError("");
    setBvnLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setBvnLoading(false);
    setBvnSubmitted(true);
  };

  const handleComplete = async () => {
    setSaving(true);
    await fetch("/api/onboarding/landlord", { method: "POST" });
    setSaving(false);
    router.push("/landlord");
  };

  return (
    <div>
      <StepIndicator steps={STEPS} currentStep={step} />
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mt-6">

        {step === 0 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Set up your landlord profile</h2>
            <p className="text-gray-500 mb-6">Verified landlords receive 3× more enquiries. This takes about 3 minutes.</p>
            <div className="text-left space-y-3 bg-gray-50 rounded-xl p-4 mb-7 text-sm text-gray-600">
              {["BVN verification — confirms your identity", "Title document upload — proves property ownership", "Earn your SafeRent Verified badge"].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#0F7B5A] mt-0.5 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <Button className="w-full" onClick={() => setStep(1)} rightIcon={<ChevronRight className="w-4 h-4" />}>Get Started</Button>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#0F7B5A]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">BVN Verification</h2>
                <p className="text-sm text-gray-500">Required to create listings and receive payments</p>
              </div>
            </div>
            {!bvnSubmitted ? (
              <>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700 mb-5">
                  Dial <strong>*565*0#</strong> on your registered phone to retrieve your BVN.
                </div>
                <Input label="Bank Verification Number (BVN)" placeholder="11-digit BVN" value={bvn}
                  onChange={(e) => setBvn(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  error={bvnError} inputMode="numeric" />
                <Button className="w-full mt-4" onClick={handleBvnSubmit} isLoading={bvnLoading} disabled={bvn.length !== 11}>Verify BVN</Button>
              </>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="w-10 h-10 text-[#0F7B5A] mx-auto mb-3" />
                <p className="font-semibold text-gray-900">BVN submitted</p>
                <p className="text-sm text-gray-500 mt-1">Verification is in progress. Continue to upload your documents.</p>
                <Button className="w-full mt-5" onClick={() => setStep(2)}>Continue</Button>
              </div>
            )}
            <button onClick={() => setStep(0)} className="mt-4 text-sm text-gray-400 hover:text-gray-600 w-full text-center">← Back</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Property Title Documents</h2>
                <p className="text-sm text-gray-500">Upload ownership proof for each property</p>
              </div>
            </div>
            <div className="space-y-4 mb-5">
              {["Certificate of Occupancy (C of O) or Deed of Assignment", "Survey Plan (optional but recommended)", "Government-issued ID matching BVN name"].map((doc) => (
                <div key={doc} className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-[#0F7B5A] transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <Upload className="w-5 h-5 text-gray-300 group-hover:text-[#0F7B5A] transition-colors" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">{doc}</p>
                      <p className="text-xs text-gray-400">Click to upload — PDF, JPG, PNG</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center mb-5">Documents are reviewed within 24–48 hours. Your listings can go live as &quot;Unverified&quot; in the meantime.</p>
            <Button className="w-full" onClick={() => setStep(3)}>Continue <ChevronRight className="w-4 h-4 ml-1 inline" /></Button>
            <button onClick={() => setStep(1)} className="mt-3 text-sm text-gray-400 hover:text-gray-600 w-full text-center">← Back</button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-[#0F7B5A]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Profile submitted!</h2>
            <p className="text-gray-500 mb-6">Your documents are under review. You&apos;ll receive a notification once verified (24–48 hours).</p>
            <div className="bg-gray-50 rounded-xl p-4 text-left text-sm space-y-2 mb-6">
              {["Documents reviewed within 48 hours", "Property Verified (Silver) badge awarded on approval", "Gold badge after first completed SafeRent transaction"].map((item) => (
                <div key={item} className="flex items-start gap-2 text-gray-600">
                  <CheckCircle className="w-4 h-4 text-[#0F7B5A] mt-0.5 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <Button className="w-full" onClick={handleComplete} isLoading={saving}>Go to My Dashboard</Button>
          </div>
        )}
      </div>
    </div>
  );
}
