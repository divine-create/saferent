import Link from "next/link";
import { Shield, CheckCircle, Globe, Video, CreditCard, Home, ArrowRight } from "lucide-react";
import { MOCK_RATES, CURRENCY_FLAGS } from "@/lib/currency";
import { DiasporaCurrencyConverter } from "./DiasporaCurrencyConverter";
import { mockListings } from "@/lib/mock-listings";
import { formatNaira } from "@/lib/utils";

export const metadata = {
  title: "Diaspora Rentals — SafeRent",
  description: "Rent a home in Nigeria from anywhere in the world. Pay in USD, GBP, or EUR.",
};

const HOW_IT_WORKS = [
  {
    icon: "🔍",
    title: "Browse verified listings",
    desc: "See prices in your currency — USD, GBP, EUR, or CAD. All listings are BVN-verified.",
  },
  {
    icon: "📹",
    title: "Virtual viewing",
    desc: "Schedule a live video walkthrough with the landlord — recorded and stored for evidence.",
  },
  {
    icon: "💳",
    title: "Pay securely in your currency",
    desc: "Pay via international card. We hold your rent in CBN-licensed escrow until confirmed move-in.",
  },
  {
    icon: "🏠",
    title: "Concierge key handover",
    desc: "SafeRent concierge handles physical inspection, live walkthrough, and key handover on your behalf.",
  },
];

const TRUST_SIGNALS = [
  "CBN-licensed escrow",
  "BVN-verified landlords",
  "Legal agreement included",
  "Disputes resolved within 7 days",
];

const CONCIERGE_INCLUDES = [
  "Physical property inspection",
  "Live video walkthrough with you",
  "Written condition report with photos",
  "Key handover oversight",
  "Utility meter readings",
  "Neighbourhood safety check",
];

export default function DiasporaPage() {
  const diasporaListings = mockListings.slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0F7B5A] rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SafeRent</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <Link href="/listings" className="hover:text-[#0F7B5A] transition-colors">Listings</Link>
            <Link href="/market" className="hover:text-[#0F7B5A] transition-colors">Market Data</Link>
            <Link href="/diaspora/concierge" className="hover:text-[#0F7B5A] transition-colors">Concierge</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-[#0F7B5A] transition-colors">Sign In</Link>
            <Link href="/register" className="bg-[#0F7B5A] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#0a6049] transition-colors">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0F7B5A] via-[#0a6049] to-[#053d2e] text-white pt-24 pb-32 px-4 overflow-hidden">
        {/* Geometric background shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#D4A017]/10 rounded-full -translate-x-1/2 translate-y-1/2" />
          <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-white/3 rotate-45" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Globe className="w-4 h-4" />
            For Nigerians in the diaspora
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            Rent a home in Nigeria from{" "}
            <span className="text-[#F5C842]">anywhere in the world</span>
          </h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto mb-10">
            Pay in USD, GBP, or EUR. We handle the rest.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/listings?diasporaReady=true"
              className="bg-[#F5C842] text-gray-900 font-bold px-8 py-4 rounded-xl text-lg hover:bg-[#e5b832] transition-colors shadow-lg inline-flex items-center gap-2"
            >
              Find Diaspora-Ready Properties
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/diaspora/concierge"
              className="bg-white/10 border-2 border-white/30 text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-white/20 transition-colors"
            >
              Book a Concierge
            </Link>
          </div>

          {/* Currency flags */}
          <div className="flex items-center justify-center gap-6 mt-12 text-green-200 text-sm">
            {(["USD", "GBP", "EUR", "CAD"] as const).map((c) => (
              <span key={c} className="flex items-center gap-1.5">
                <span className="text-lg">{CURRENCY_FLAGS[c]}</span>
                <span>{c}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals bar */}
      <section className="bg-gray-900 py-4 px-4">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-x-8 gap-y-2">
          {TRUST_SIGNALS.map((s) => (
            <div key={s} className="flex items-center gap-2 text-sm text-gray-300">
              <CheckCircle className="w-4 h-4 text-[#0F7B5A]" />
              {s}
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How it works</h2>
            <p className="text-gray-500 text-lg">Four steps from search to keys — without leaving your city</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm relative">
                <div className="absolute -top-3 -left-3 w-7 h-7 bg-[#0F7B5A] text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {i + 1}
                </div>
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Currency converter */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Currency Converter</h2>
            <p className="text-gray-500">See how much your rent costs in your currency</p>
          </div>
          <DiasporaCurrencyConverter />
        </div>
      </section>

      {/* Concierge package */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">SafeRent Concierge</h2>
            <p className="text-gray-500">We act as your boots on the ground</p>
          </div>
          <div className="bg-gradient-to-br from-[#0F7B5A]/5 to-[#D4A017]/5 border border-[#0F7B5A]/20 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#0F7B5A] rounded-xl flex items-center justify-center">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">SafeRent Concierge</h3>
                    <p className="text-[#0F7B5A] font-semibold">₦50,000 flat fee</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-5 text-sm">
                  A vetted SafeRent staff member physically visits the property, conducts a live video walkthrough with you, and oversees key handover.
                </p>
                <ul className="space-y-2 mb-6">
                  {CONCIERGE_INCLUDES.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-[#0F7B5A] mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/diaspora/concierge"
                  className="inline-flex items-center gap-2 bg-[#0F7B5A] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#0a6049] transition-colors"
                >
                  Book a Concierge
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="md:w-56 bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">You get</p>
                {[
                  { icon: "📸", label: "20+ photos from visit" },
                  { icon: "🎥", label: "Live video call" },
                  { icon: "📄", label: "Written report" },
                  { icon: "🔑", label: "Key handover oversight" },
                  { icon: "✅", label: "Agent background-checked" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm text-gray-700">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured diaspora listings */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">Diaspora-Ready Listings</h2>
              <p className="text-gray-500">Properties with virtual tours and international payment support</p>
            </div>
            <Link href="/listings?diasporaReady=true" className="text-[#0F7B5A] font-semibold text-sm hover:underline hidden md:block">
              View all →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {diasporaListings.map((listing) => {
              const usdRent = Math.round(listing.annualRent * MOCK_RATES.USD);
              return (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
                >
                  <div className="h-44 bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center relative">
                    <Building2Icon />
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 bg-[#0F7B5A] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                        <Globe className="w-3 h-3" />
                        Diaspora Ready
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="bg-white text-gray-900 text-xs font-bold px-2.5 py-1 rounded-full shadow">
                        ${usdRent.toLocaleString()} USD
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-1 group-hover:text-[#0F7B5A] transition-colors">
                      {listing.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">{listing.area}, {listing.state}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">{formatNaira(listing.annualRent)} p.a.</span>
                      <span className="text-xs text-gray-400">{listing.bedrooms} bed</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/listings?diasporaReady=true"
              className="inline-flex items-center gap-2 text-[#0F7B5A] font-semibold hover:underline"
            >
              View all diaspora-ready listings
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-4 bg-[#0F7B5A] text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to find your home?</h2>
          <p className="text-green-100 mb-8 text-lg">Join thousands of diaspora Nigerians who rent safely with SafeRent.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?role=TENANT" className="bg-[#F5C842] text-gray-900 font-bold px-8 py-4 rounded-xl hover:bg-[#e5b832] transition-colors">
              Create Free Account
            </Link>
            <Link href="/listings?diasporaReady=true" className="bg-white/10 border-2 border-white/30 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/20 transition-colors">
              Browse Listings
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Building2Icon() {
  return (
    <svg className="w-16 h-16 text-[#0F7B5A]/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <path d="M8 3v18M16 3v18M2 9h20M2 15h20" />
    </svg>
  );
}
