"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const WHAT_IS_INCLUDED = [
  {
    icon: "🏠",
    title: "Physical property inspection",
    desc: "Our vetted agent visits the property in person, checking every room and condition.",
  },
  {
    icon: "🎥",
    title: "Live video walkthrough",
    desc: "We conduct a scheduled live video call with you — showing every corner of the property.",
  },
  {
    icon: "📄",
    title: "Written condition report",
    desc: "A detailed written report with 20+ photos documenting the property state.",
  },
  {
    icon: "🔑",
    title: "Key handover oversight",
    desc: "Our agent is present at key handover and confirms receipt on your behalf.",
  },
  {
    icon: "⚡",
    title: "Utility meter readings",
    desc: "We document electricity, water, and gas meter readings at handover.",
  },
  {
    icon: "🛡️",
    title: "Neighbourhood safety check",
    desc: "We provide a brief safety and accessibility assessment of the neighbourhood.",
  },
];

export default function ConciergePage() {
  const [form, setForm] = useState({
    listingUrl: "",
    dateFrom: "",
    dateTo: "",
    whatsapp: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.whatsapp) {
      setError("Please provide your WhatsApp number");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingUrl: form.listingUrl || undefined,
          inspectionDateFrom: form.dateFrom || undefined,
          inspectionDateTo: form.dateTo || undefined,
          whatsappNumber: form.whatsapp,
          message: form.message || undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Booking failed");
      }
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0F7B5A] rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SafeRent</span>
          </Link>
          <Link href="/diaspora" className="text-sm text-gray-600 hover:text-[#0F7B5A] flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Diaspora
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#0F7B5A]/10 text-[#0F7B5A] text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            🏠 For Diaspora Tenants
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">SafeRent Concierge</h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            We act as your boots on the ground — inspecting, reporting, and overseeing key handover on your behalf.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* What&apos;s included */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">What&apos;s included</h2>
              <span className="bg-[#0F7B5A] text-white text-sm font-bold px-3 py-1 rounded-full">₦50,000 flat</span>
            </div>
            <div className="space-y-4">
              {WHAT_IS_INCLUDED.map((item) => (
                <div key={item.title} className="flex gap-4 bg-white rounded-xl border border-gray-100 p-4">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>All concierge agents are vetted SafeRent staff with background checks and identification on file.</p>
              </div>
            </div>
          </div>

          {/* Booking form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-8 h-8 text-[#0F7B5A]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
                <p className="text-gray-500 mb-1">
                  Your concierge booking has been received.
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  A SafeRent concierge coordinator will contact you on WhatsApp within 2 hours to schedule your inspection.
                </p>
                <div className="bg-gray-50 rounded-xl p-4 text-left text-sm text-gray-600 mb-6">
                  <p className="font-semibold text-gray-700 mb-2">Next steps:</p>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#0F7B5A]" /> Concierge coordinator contacts you on WhatsApp</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#0F7B5A]" /> Fee of ₦50,000 invoiced via SafeRent app</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#0F7B5A]" /> Inspection scheduled within agreed dates</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#0F7B5A]" /> Report delivered within 24 hours of visit</li>
                  </ul>
                </div>
                <Link href="/listings?diasporaReady=true" className="text-[#0F7B5A] font-semibold text-sm hover:underline">
                  Browse diaspora-ready listings →
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Book a Concierge</h2>
                <p className="text-sm text-gray-500 mb-5">Fill in the details below and we&apos;ll reach out within 2 hours.</p>

                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-700 mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Listing URL or ID <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={form.listingUrl}
                      onChange={(e) => handleChange("listingUrl", e.target.value)}
                      placeholder="https://saferent.ng/listings/..."
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-400 mt-1">Or provide the full address of the property.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Inspection from</label>
                      <input
                        type="date"
                        value={form.dateFrom}
                        onChange={(e) => handleChange("dateFrom", e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Inspection to</label>
                      <input
                        type="date"
                        value={form.dateTo}
                        onChange={(e) => handleChange("dateTo", e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      WhatsApp number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={form.whatsapp}
                      onChange={(e) => handleChange("whatsapp", e.target.value)}
                      placeholder="+44 7911 123456"
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-400 mt-1">Include your country code. We&apos;ll send updates here.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Message to concierge <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      placeholder="Any specific things you'd like us to check..."
                      rows={3}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A] focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="bg-[#0F7B5A]/5 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Concierge fee</span>
                    <span className="text-[#0F7B5A] font-bold">₦50,000</span>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Booking...</>
                    ) : (
                      "Book Concierge"
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
