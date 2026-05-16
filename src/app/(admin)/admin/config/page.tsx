"use client";

import { useState } from "react";

function Section({
  title,
  children,
  onSave,
}: {
  title: string;
  children: React.ReactNode;
  onSave: () => void;
}) {
  const [saved, setSaved] = useState(false);

  function handleSave() {
    onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <button
          onClick={handleSave}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            saved
              ? "bg-green-100 text-green-700"
              : "bg-[#0F7B5A] text-white hover:bg-[#0a6049]"
          }`}
        >
          {saved ? "Saved!" : "Save"}
        </button>
      </div>
      {children}
    </div>
  );
}

function Toggle({
  label,
  description,
  defaultChecked,
}: {
  label: string;
  description?: string;
  defaultChecked: boolean;
}) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${on ? "bg-[#0F7B5A]" : "bg-gray-200"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}

function FieldRow({ label, value, prefix, suffix }: { label: string; value: string; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(value);
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <label className="text-sm text-gray-700 flex-1">{label}</label>
      <div className="flex items-center gap-1.5">
        {prefix && <span className="text-sm text-gray-500">{prefix}</span>}
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="w-28 text-right px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30"
        />
        {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
      </div>
    </div>
  );
}

const STATES = [
  { name: "Lagos", default: true },
  { name: "Abuja FCT", default: true },
  { name: "Ogun", default: false },
  { name: "Rivers", default: false },
  { name: "Kano", default: false },
  { name: "Oyo", default: false },
  { name: "Delta", default: false },
  { name: "Anambra", default: false },
];

export default function AdminConfigPage() {
  const [selectedStates, setSelectedStates] = useState<Set<string>>(
    new Set(STATES.filter((s) => s.default).map((s) => s.name))
  );

  function toggleState(state: string) {
    setSelectedStates((prev) => {
      const next = new Set(prev);
      if (next.has(state)) next.delete(state);
      else next.add(state);
      return next;
    });
  }

  function noop() {}

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuration</h1>
        <p className="text-gray-500 text-sm mt-0.5">Platform settings and feature flags</p>
      </div>

      {/* Fee rates */}
      <Section title="Fee Rates" onSave={noop}>
        <FieldRow label="Transaction fee" value="5" suffix="%" />
        <FieldRow label="Document fee" value="8,000" prefix="₦" />
        <FieldRow label="Caution deposit default" value="20" suffix="% of rent" />
      </Section>

      {/* Agent subscription prices */}
      <Section title="Agent Subscription Prices" onSave={noop}>
        <FieldRow label="Basic" value="15,000" prefix="₦" suffix="/month" />
        <FieldRow label="Pro" value="35,000" prefix="₦" suffix="/month" />
        <FieldRow label="Enterprise" value="80,000" prefix="₦" suffix="/month" />
      </Section>

      {/* Feature flags */}
      <Section title="Feature Flags" onSave={noop}>
        <Toggle label="Installment payments" description="Phase 2 feature" defaultChecked={false} />
        <Toggle label="WhatsApp notifications" description="Phase 2 feature" defaultChecked={false} />
        <Toggle label="Diaspora features" description="Phase 3 feature" defaultChecked={false} />
        <Toggle label="Virtual viewings" description="360° tour support" defaultChecked={true} />
        <Toggle label="Agent subscriptions" description="Subscription billing" defaultChecked={true} />
      </Section>

      {/* Supported states */}
      <Section title="Supported States" onSave={noop}>
        <p className="text-xs text-gray-400 mb-3">Select which Nigerian states SafeRent operates in</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {STATES.map((s) => (
            <label
              key={s.name}
              className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                selectedStates.has(s.name)
                  ? "border-[#0F7B5A] bg-[#0F7B5A]/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedStates.has(s.name)}
                onChange={() => toggleState(s.name)}
                className="accent-[#0F7B5A]"
              />
              <span className="text-sm text-gray-700">{s.name}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Dispute SLA settings */}
      <Section title="Dispute SLA Settings" onSave={noop}>
        <FieldRow label="Evidence collection" value="2" suffix="days" />
        <FieldRow label="Mediation" value="3" suffix="days" />
        <FieldRow label="Adjudication" value="7" suffix="days" />
      </Section>
    </div>
  );
}
