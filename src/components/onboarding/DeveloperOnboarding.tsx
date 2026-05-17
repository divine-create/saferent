"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StepIndicator } from "@/components/ui/StepIndicator";

const STEPS = [
  { label: "Welcome", description: "Get started" },
  { label: "Company", description: "Business details" },
  { label: "Portfolio", description: "Property info" },
  { label: "Complete", description: "All done" },
];

const PROPERTY_TYPES = ["Residential Apartments", "Duplexes", "Terraced Houses", "Commercial", "Mixed Use"];
const STATES = ["Lagos", "Abuja (FCT)", "Rivers", "Oyo", "Kano", "Delta", "Edo", "Ogun", "Anambra", "Other"];

export function DeveloperOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [company, setCompany] = useState({
    name: "",
    cac: "",
    rc: "",
    address: "",
    website: "",
  });

  const [portfolio, setPortfolio] = useState({
    totalUnits: "",
    propertyTypes: [] as string[],
    states: [] as string[],
  });

  const toggleItem = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
  };

  const handleComplete = async () => {
    setSaving(true);
    // Mock API call
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    router.push("/developer");
  };

  return (
    <div>
      <StepIndicator steps={STEPS} currentStep={step} />
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mt-6">

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-[#0F7B5A]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Building2 className="w-8 h-8 text-[#0F7B5A]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Developer & Estate Company Portal</h2>
            <p className="text-gray-500 mb-5 max-w-md mx-auto">
              Built for property developers and estate management companies with 10+ units. Get a dedicated account manager, bulk unit management tools, and enterprise-grade analytics.
            </p>
            <div className="text-left space-y-3 bg-gray-50 rounded-xl p-4 mb-7 text-sm text-gray-600">
              {[
                "Portfolio dashboard — all units in one place",
                "Bulk tenant management and CSV import/export",
                "Revenue analytics and occupancy tracking",
                "Dedicated SafeRent account manager",
                "Priority support and SLA commitments",
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

        {/* Step 1: Company details */}
        {step === 1 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#0F7B5A]/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#0F7B5A]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Company Details</h2>
                <p className="text-sm text-gray-500">Tell us about your organisation</p>
              </div>
            </div>
            <div className="space-y-4">
              <Input
                label="Company Name"
                placeholder="e.g. Heritage Estates Ltd"
                value={company.name}
                onChange={(e) => setCompany({ ...company, name: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="CAC Number"
                  placeholder="e.g. BN-1234567"
                  value={company.cac}
                  onChange={(e) => setCompany({ ...company, cac: e.target.value })}
                />
                <Input
                  label="RC Number"
                  placeholder="e.g. RC-0012345"
                  value={company.rc}
                  onChange={(e) => setCompany({ ...company, rc: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Address</label>
                <textarea
                  value={company.address}
                  onChange={(e) => setCompany({ ...company, address: e.target.value })}
                  placeholder="Full registered address"
                  rows={2}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A] resize-none"
                />
              </div>
              <Input
                label="Website (optional)"
                placeholder="https://yourcompany.com"
                value={company.website}
                onChange={(e) => setCompany({ ...company, website: e.target.value })}
              />
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>Back</Button>
              <Button className="flex-1" onClick={() => setStep(2)} disabled={!company.name}>
                Continue <ChevronRight className="w-4 h-4 ml-1 inline" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Portfolio info */}
        {step === 2 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Portfolio Information</h2>
                <p className="text-sm text-gray-500">Help us understand your portfolio size</p>
              </div>
            </div>
            <div className="space-y-5">
              <Input
                label="Estimated Total Units"
                placeholder="e.g. 50"
                type="number"
                value={portfolio.totalUnits}
                onChange={(e) => setPortfolio({ ...portfolio, totalUnits: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Types <span className="text-gray-400 font-normal">(select all that apply)</span></label>
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleItem(portfolio.propertyTypes, t, (v) => setPortfolio({ ...portfolio, propertyTypes: v }))}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        portfolio.propertyTypes.includes(t)
                          ? "bg-[#0F7B5A] text-white border-[#0F7B5A]"
                          : "bg-white text-gray-700 border-gray-200 hover:border-[#0F7B5A]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">States Operating In <span className="text-gray-400 font-normal">(select all that apply)</span></label>
                <div className="flex flex-wrap gap-2">
                  {STATES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleItem(portfolio.states, s, (v) => setPortfolio({ ...portfolio, states: v }))}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        portfolio.states.includes(s)
                          ? "bg-[#0F7B5A] text-white border-[#0F7B5A]"
                          : "bg-white text-gray-700 border-gray-200 hover:border-[#0F7B5A]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
              <Button className="flex-1" onClick={() => setStep(3)}>
                Continue <ChevronRight className="w-4 h-4 ml-1 inline" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Complete */}
        {step === 3 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-[#0F7B5A]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
            <p className="text-gray-500 mb-5 max-w-sm mx-auto">
              Your developer account is under review. Your dedicated account manager will contact you within 24 hours.
            </p>
            <div className="bg-[#0F7B5A]/5 border border-[#0F7B5A]/20 rounded-xl p-4 text-left space-y-2 text-sm mb-6">
              <p className="font-semibold text-gray-700 mb-2">What happens next:</p>
              {[
                "Account manager reviews your application",
                "A welcome call is scheduled within 24 hours",
                "Your enterprise dashboard is activated",
                "Bulk unit import tools are unlocked",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-gray-600">
                  <CheckCircle className="w-4 h-4 text-[#0F7B5A] mt-0.5 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <Button className="w-full" onClick={handleComplete} disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> Setting up...</> : "Go to Developer Portal"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
