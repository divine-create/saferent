"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, CheckCircle, ChevronRight, Crown, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { formatNaira } from "@/lib/utils";

const STEPS = [
  { label: "Welcome", description: "Get started" },
  { label: "Business", description: "CAC & LASRERA" },
  { label: "Plan", description: "Choose subscription" },
  { label: "Complete", description: "Go live" },
];

type Plan = "BASIC" | "PRO" | "ENTERPRISE";

const PLANS = [
  { id: "BASIC" as Plan, name: "Basic", price: 15000, listings: 10, features: ["10 active listings", "Enquiry inbox", "Basic analytics", "SafeRent profile badge"] },
  { id: "PRO" as Plan, name: "Pro", price: 35000, listings: 50, features: ["50 active listings", "Client CRM", "Commission tracking", "Priority search placement", "Auto-invoicing"], highlight: true },
  { id: "ENTERPRISE" as Plan, name: "Enterprise", price: 80000, listings: -1, features: ["Unlimited listings", "Dedicated account manager", "Bulk CSV import", "Custom reporting", "API access"] },
];

export function AgentOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState("");
  const [cacNumber, setCacNumber] = useState("");
  const [lasreraNumber, setLasreraNumber] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<Plan>("PRO");
  const [saving, setSaving] = useState(false);

  const handleComplete = async () => {
    setSaving(true);
    await fetch("/api/onboarding/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessName, cacNumber, lasreraNumber, subscriptionPlan: selectedPlan }),
    });
    setSaving(false);
    router.push("/agent");
  };

  return (
    <div>
      <StepIndicator steps={STEPS} currentStep={step} />
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mt-6">

        {step === 0 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Set up your agent profile</h2>
            <p className="text-gray-500 mb-6">Join Nigeria&apos;s most trusted rental marketplace. Verified agents earn more leads and close faster.</p>
            <div className="text-left space-y-3 bg-gray-50 rounded-xl p-4 mb-7 text-sm text-gray-600">
              {["CAC registration verification", "LASRERA number (required for Lagos)", "Choose a subscription plan to go live"].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#0F7B5A] mt-0.5 shrink-0" />{item}
                </div>
              ))}
            </div>
            <Button className="w-full" onClick={() => setStep(1)} rightIcon={<ChevronRight className="w-4 h-4" />}>Get Started</Button>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Business Details</h2>
                <p className="text-sm text-gray-500">Your CAC and LASRERA credentials</p>
              </div>
            </div>
            <div className="space-y-4">
              <Input label="Business / Agency Name" placeholder="e.g. Apex Properties Ltd" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
              <Input label="CAC Registration Number" placeholder="RC-0000000" value={cacNumber} onChange={(e) => setCacNumber(e.target.value)} />
              <div>
                <Input label="LASRERA Number (Lagos agents)" placeholder="LAS-0000000" value={lasreraNumber} onChange={(e) => setLasreraNumber(e.target.value)} />
                <p className="text-xs text-gray-400 mt-1">Required if you list properties in Lagos State. Leave blank for other states.</p>
              </div>
            </div>
            <Button className="w-full mt-6" onClick={() => setStep(2)} disabled={!businessName || !cacNumber}>Continue <ChevronRight className="w-4 h-4 ml-1 inline" /></Button>
            <button onClick={() => setStep(0)} className="mt-3 text-sm text-gray-400 hover:text-gray-600 w-full text-center">← Back</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Choose Your Plan</h2>
                <p className="text-sm text-gray-500">Activate to start listing properties</p>
              </div>
            </div>
            <div className="space-y-3 mb-5">
              {PLANS.map((plan) => (
                <label key={plan.id} className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPlan === plan.id ? "border-[#0F7B5A] bg-green-50" : "border-gray-100 hover:border-gray-200"} ${plan.highlight ? "ring-1 ring-[#D4A017]" : ""}`}>
                  <input type="radio" name="plan" value={plan.id} checked={selectedPlan === plan.id} onChange={() => setSelectedPlan(plan.id)} className="sr-only" />
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{plan.name}</span>
                      {plan.highlight && <span className="bg-[#D4A017] text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><Star className="w-2.5 h-2.5" /> Popular</span>}
                    </div>
                    <span className="font-bold text-[#0F7B5A]">{formatNaira(plan.price)}<span className="text-gray-400 font-normal text-xs">/mo</span></span>
                  </div>
                  <ul className="space-y-1">
                    {plan.features.map((f) => (
                      <li key={f} className="text-xs text-gray-500 flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3 text-[#0F7B5A] shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center mb-4">Payment collected at the end of setup. Cancel anytime.</p>
            <Button className="w-full" onClick={() => setStep(3)}>Select {selectedPlan} Plan <ChevronRight className="w-4 h-4 ml-1 inline" /></Button>
            <button onClick={() => setStep(1)} className="mt-3 text-sm text-gray-400 hover:text-gray-600 w-full text-center">← Back</button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-[#0F7B5A]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">You&apos;re ready to go!</h2>
            <p className="text-gray-500 mb-6">Your agent profile has been created. CAC verification will be confirmed within 48 hours.</p>
            <div className="bg-gray-50 rounded-xl p-4 text-left text-sm space-y-2 mb-6">
              <p className="font-semibold text-gray-700 mb-2">Your {selectedPlan} plan includes:</p>
              {PLANS.find((p) => p.id === selectedPlan)?.features.map((f) => (
                <div key={f} className="flex items-start gap-2 text-gray-600">
                  <CheckCircle className="w-4 h-4 text-[#0F7B5A] mt-0.5 shrink-0" />{f}
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
