import Link from "next/link";
import {
  Shield,
  CheckCircle,
  FileText,
  MapPin,
  Star,
  ArrowRight,
  Lock,
  Users,
  Building,
  Globe,
  Video,
  CreditCard,
  Zap,
  Heart,
} from "lucide-react";
import { mockListings } from "@/lib/mock-listings";

export default function HomePage() {
  const featured = mockListings.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ─── SECTION 1: HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center bg-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-[#0F7B5A]/5 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#D4A017]/5 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 lg:py-0">
          <div className="grid lg:grid-cols-5 gap-16 items-center">
            {/* Left: 60% */}
            <div className="lg:col-span-3 space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-[#0F7B5A]/10 text-[#0F7B5A] text-sm font-semibold px-4 py-2 rounded-full border border-[#0F7B5A]/20">
                <span className="text-base">🇳🇬</span>
                Nigeria&apos;s #1 Verified Rental Platform
              </div>

              {/* H1 */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.05] tracking-tight">
                Rent your next home —{" "}
                <span className="text-[#0F7B5A] relative">
                  safely.
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    height="6"
                    viewBox="0 0 300 6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="M0 3 Q75 0.5 150 3 Q225 5.5 300 3" stroke="#D4A017" strokeWidth="3" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                SafeRent protects every payment with escrow, verifies every landlord, and gives you a legal tenancy agreement — all in one place.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/listings"
                  className="inline-flex items-center justify-center gap-2 bg-[#0F7B5A] text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-[#0a6049] transition-all shadow-lg shadow-[#0F7B5A]/25 hover:shadow-xl hover:shadow-[#0F7B5A]/30 hover:-translate-y-0.5"
                >
                  Find a Home
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 border-2 border-gray-900 text-gray-900 font-bold px-8 py-4 rounded-xl text-lg hover:bg-gray-900 hover:text-white transition-all"
                >
                  List Your Property
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {[
                  { icon: "🔒", label: "CBN-Licensed Escrow" },
                  { icon: "✅", label: "BVN-Verified Landlords" },
                  { icon: "📄", label: "Legal Agreement Included" },
                  { icon: "⭐", label: "4.8/5 Average Rating" },
                ].map((badge) => (
                  <div
                    key={badge.label}
                    className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100"
                  >
                    <span className="text-lg leading-none">{badge.icon}</span>
                    <span className="text-xs font-semibold text-gray-700 leading-tight">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Card Stack 40% */}
            <div className="lg:col-span-2 flex items-center justify-center relative">
              {/* Background glow */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-72 h-72 rounded-full bg-gradient-to-br from-[#0F7B5A]/20 to-[#D4A017]/10 blur-2xl" />
              </div>

              {/* Card stack */}
              <div className="relative w-72 h-80">
                {/* Card 3 — furthest back */}
                <div
                  className="absolute inset-0 bg-white rounded-2xl border border-gray-200 shadow-md p-5"
                  style={{ transform: "rotate(6deg) translateX(12px) translateY(-8px)" }}
                >
                  <div className="h-28 bg-gradient-to-br from-[#D4A017]/20 to-amber-50 rounded-xl mb-3 flex items-center justify-center">
                    <Building className="w-10 h-10 text-[#D4A017]/40" />
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full mb-2 w-3/4" />
                  <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                </div>

                {/* Card 2 — middle */}
                <div
                  className="absolute inset-0 bg-white rounded-2xl border border-gray-200 shadow-lg p-5"
                  style={{ transform: "rotate(-3deg) translateX(-8px) translateY(4px)" }}
                >
                  <div className="h-28 bg-gradient-to-br from-emerald-100 to-green-50 rounded-xl mb-3 flex items-center justify-center">
                    <Building className="w-10 h-10 text-[#0F7B5A]/30" />
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full mb-2 w-2/3" />
                  <div className="h-3 bg-gray-100 rounded-full w-2/5" />
                </div>

                {/* Card 1 — front */}
                <div className="absolute inset-0 bg-white rounded-2xl border border-gray-200 shadow-2xl p-5">
                  <div className="relative h-32 bg-gradient-to-br from-[#0F7B5A]/15 to-emerald-50 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                    <Building className="w-12 h-12 text-[#0F7B5A]/25" />
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 bg-[#0F7B5A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-2.5 h-2.5" />
                        Verified
                      </span>
                    </div>
                    <button className="absolute top-3 right-3 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center">
                      <Heart className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mb-1">3 bed · 3 bath · Flat</p>
                  <p className="text-sm font-bold text-gray-900 mb-1">3-Bed Flat, Lekki Phase 1</p>
                  <p className="text-[10px] text-gray-500 flex items-center gap-1 mb-3">
                    <MapPin className="w-2.5 h-2.5" />
                    Lekki Phase 1, Lagos
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-extrabold text-[#0F7B5A]">₦4,500,000</span>
                    <span className="text-[10px] text-gray-400">p.a.</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-50">
                    <div className="w-5 h-5 rounded-full bg-[#0F7B5A] flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">A</span>
                    </div>
                    <span className="text-[10px] text-gray-600 font-medium">Adaeze O.</span>
                    <span className="ml-auto text-[10px] bg-[#D4A017]/15 text-[#9a7010] font-bold px-1.5 py-0.5 rounded-full">★ Certified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: STATS BAR ────────────────────────────────────── */}
      <section className="bg-[#0F7B5A] py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/20">
            {[
              { value: "₦4.2B+", label: "Rent secured in escrow" },
              { value: "2,847", label: "Verified listings" },
              { value: "1,203", label: "Families housed" },
              { value: "4.8★", label: "Average landlord rating" },
            ].map((stat) => (
              <div key={stat.label} className="text-center py-4 px-6">
                <div className="text-3xl font-extrabold text-white">{stat.value}</div>
                <div className="text-green-200 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: HOW IT WORKS ─────────────────────────────────── */}
      <section className="py-24 px-4" id="how-it-works">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#0F7B5A] font-semibold text-sm uppercase tracking-wider mb-3">Simple. Transparent. Safe.</p>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">How SafeRent Works</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Four steps from search to keys in hand — fully protected at every stage.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 relative">
            {/* Connector line (desktop only) */}
            <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-[#0F7B5A]/30 to-transparent" />

            {[
              { num: "01", icon: "🔍", title: "Search", desc: "Browse verified listings with real photos and accurate prices across Lagos, Abuja, and beyond.", bg: "bg-white" },
              { num: "02", icon: "📅", title: "View", desc: "Book physical or virtual viewings directly through the app. See the property before you commit.", bg: "bg-gray-50" },
              { num: "03", icon: "💳", title: "Pay Safely", desc: "Your rent goes into escrow — the landlord only gets paid after you physically move in. Zero risk.", bg: "bg-white" },
              { num: "04", icon: "🏠", title: "Move In", desc: "Sign your digital tenancy agreement and collect your keys — legally protected and stress-free.", bg: "bg-gray-50" },
            ].map((step, i) => (
              <div key={step.num} className={`${step.bg} p-8 text-center relative group`}>
                {/* Step number */}
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#0F7B5A]/10 flex items-center justify-center group-hover:bg-[#0F7B5A]/15 transition-colors">
                    <span className="text-2xl">{step.icon}</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#0F7B5A] text-white text-xs font-extrabold rounded-full flex items-center justify-center">
                    {i + 1}
                  </div>
                </div>
                <div className="text-xs font-bold text-[#0F7B5A]/40 tracking-widest mb-2">{step.num}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: FOR TENANTS / LANDLORDS / AGENTS ─────────────── */}
      <section className="py-24 px-4 bg-gray-50" id="for-landlords">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Built for every side of the market</h2>
            <p className="text-gray-500 text-lg">Whether you&apos;re renting, listing, or facilitating — SafeRent has you covered.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Tenant Card */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="bg-[#0F7B5A] px-6 py-5">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">For Tenants</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  {[
                    "No advance-fee fraud — funds held in escrow",
                    "Monthly installments for qualified tenants",
                    "BVN-verified landlords only",
                    "Legal agreement at ₦8,000 flat fee",
                  ].map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-[#0F7B5A] mt-0.5 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register?role=TENANT"
                  className="flex items-center justify-center gap-2 w-full bg-[#0F7B5A] text-white font-semibold py-3 rounded-xl hover:bg-[#0a6049] transition-colors"
                >
                  Find a Home <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Landlord Card */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="bg-[#D4A017] px-6 py-5">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">For Landlords</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  {[
                    "Pre-screened, BVN-verified tenants",
                    "Payment guaranteed before move-in",
                    "Digital records for every transaction",
                    "Gold badge after first successful let",
                  ].map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-[#D4A017] mt-0.5 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register?role=LANDLORD"
                  className="flex items-center justify-center gap-2 w-full bg-[#D4A017] text-white font-semibold py-3 rounded-xl hover:bg-[#b8880f] transition-colors"
                >
                  List Your Property <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Agent Card */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="bg-gray-900 px-6 py-5">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-3">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">For Agents</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  {[
                    "Professional verified profile",
                    "Multi-property listing tools + CRM",
                    "Commission tracking and invoicing",
                    "Pro badge for top agents",
                  ].map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register?role=AGENT"
                  className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Join as Agent <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: FEATURED LISTINGS ────────────────────────────── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[#0F7B5A] font-semibold text-sm uppercase tracking-wider mb-2">Hand-picked properties</p>
              <h2 className="text-4xl font-extrabold text-gray-900">Verified Listings Near You</h2>
            </div>
            <Link
              href="/listings"
              className="hidden md:inline-flex items-center gap-2 text-[#0F7B5A] font-semibold hover:gap-3 transition-all"
            >
              Browse all listings <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featured.map((listing) => {
              const photoUrl = listing.photos[0]?.url;
              const ownerName = [listing.owner.firstName, listing.owner.lastName].join(" ");
              const annualRentFmt = `₦${(listing.annualRent / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
              return (
                <Link
                  key={listing.id}
                  href="/listings"
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl overflow-hidden transition-all hover:scale-[1.02] hover:border-[#0F7B5A]/20"
                >
                  {/* Photo */}
                  <div className="relative h-52 overflow-hidden bg-gray-100">
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoUrl}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-50">
                        <Building className="w-12 h-12 text-[#0F7B5A]/20" />
                      </div>
                    )}
                    {/* Verified badge */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 bg-[#0F7B5A] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    </div>
                    {/* Heart */}
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors">
                      <Heart className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <p className="text-xs text-gray-400 mb-2">
                      {listing.propertyType} · {listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms} bed`} · {listing.bathrooms} bath
                    </p>
                    <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 group-hover:text-[#0F7B5A] transition-colors line-clamp-2">
                      {listing.title}
                    </h3>
                    <p className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {listing.area}, {listing.state}
                    </p>

                    {/* Amenity icons row */}
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      {listing.amenities.slice(0, 4).map((a) => (
                        <span key={a} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                          {a}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div>
                        <span className="text-xl font-extrabold text-[#0F7B5A]">{annualRentFmt}</span>
                        <span className="text-xs text-gray-400 ml-1">p.a.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#0F7B5A] flex items-center justify-center">
                          <span className="text-white text-[9px] font-bold">
                            {listing.owner.firstName[0]}{listing.owner.lastName[0]}
                          </span>
                        </div>
                        <span className="text-xs text-gray-600 font-medium">{ownerName}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 bg-[#0F7B5A] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#0a6049] transition-colors shadow-lg shadow-[#0F7B5A]/20"
            >
              Browse all listings <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: TRUST & SAFETY ───────────────────────────────── */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <p className="text-[#0F7B5A] font-semibold text-sm uppercase tracking-wider mb-4">Escrow Protection</p>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                Your money is protected — always.
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                SafeRent uses a CBN-licensed escrow account to hold your rent securely. The landlord doesn&apos;t see a kobo until you&apos;ve physically confirmed your move-in.
              </p>
              <div className="space-y-4">
                {[
                  { step: "1", title: "You pay into escrow", desc: "Your rent is held in a regulated escrow account — not directly to the landlord." },
                  { step: "2", title: "SafeRent holds it safely", desc: "Funds are held until you confirm move-in. Any dispute freezes the release." },
                  { step: "3", title: "Landlord gets paid after move-in", desc: "Once you confirm everything is in order, funds are released within 24 hours." },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#0F7B5A] text-white flex items-center justify-center shrink-0 font-bold text-sm">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                      <p className="text-gray-500 text-sm mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Escrow flow diagram */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-full max-w-sm">
                {/* Tenant pays */}
                <div className="bg-white rounded-2xl border-2 border-[#0F7B5A]/30 p-5 text-center shadow-sm">
                  <div className="w-10 h-10 bg-[#0F7B5A]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="w-5 h-5 text-[#0F7B5A]" />
                  </div>
                  <p className="font-bold text-gray-900">Tenant Pays</p>
                  <p className="text-xs text-gray-500 mt-1">Rent goes into secure escrow</p>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center py-2">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-px h-6 bg-[#0F7B5A]" />
                    <div className="w-2 h-2 rotate-45 border-r-2 border-b-2 border-[#0F7B5A]" />
                  </div>
                </div>

                {/* Escrow */}
                <div className="bg-[#0F7B5A] rounded-2xl p-5 text-center shadow-lg">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-bold text-white">SafeRent Escrow</p>
                  <p className="text-xs text-green-200 mt-1">Held safely · CBN-licensed</p>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">72hr dispute SLA</span>
                    <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">0% fraud rate</span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center py-2">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-px h-6 bg-[#0F7B5A]" />
                    <div className="w-2 h-2 rotate-45 border-r-2 border-b-2 border-[#0F7B5A]" />
                  </div>
                </div>

                {/* Landlord gets paid */}
                <div className="bg-white rounded-2xl border-2 border-[#D4A017]/30 p-5 text-center shadow-sm">
                  <div className="w-10 h-10 bg-[#D4A017]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Building className="w-5 h-5 text-[#D4A017]" />
                  </div>
                  <p className="font-bold text-gray-900">Landlord Gets Paid</p>
                  <p className="text-xs text-gray-500 mt-1">After tenant confirms move-in</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 7: TESTIMONIALS ─────────────────────────────────── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#0F7B5A] font-semibold text-sm uppercase tracking-wider mb-3">Real stories</p>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Trusted by thousands of Nigerians</h2>
            <p className="text-gray-500 text-lg">From Lagos to London — SafeRent works for everyone.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "I sent my rent from London and my flat was ready on arrival. SafeRent&apos;s escrow gave me complete peace of mind.",
                name: "Adaeze O.",
                role: "Tenant, Lagos",
                initials: "AO",
                color: "bg-[#0F7B5A]",
              },
              {
                quote: "My tenant&apos;s BVN was verified before I handed over keys. First time I&apos;ve felt completely safe renting out my property.",
                name: "Babatunde A.",
                role: "Landlord, Lagos",
                initials: "BA",
                color: "bg-[#D4A017]",
              },
              {
                quote: "The CRM and bulk listing tools save me hours every week. My conversion rate has doubled since joining SafeRent.",
                name: "Chukwudi E.",
                role: "Agent, Lagos",
                initials: "CE",
                color: "bg-gray-800",
              },
            ].map((t) => (
              <div key={t.name} className="bg-gray-50 rounded-2xl p-7 border border-gray-100 hover:shadow-md transition-all">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#D4A017] text-[#D4A017]" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-6 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${t.color} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">{t.initials}</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 8: DIASPORA CTA ─────────────────────────────────── */}
      <section className="py-24 px-4 bg-gradient-to-br from-[#0F7B5A] via-[#0a6049] to-[#084d3a] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[#D4A017]/10 blur-2xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/15 text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <Globe className="w-4 h-4" />
            For the Nigerian Diaspora
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
            Renting from the UK, US, or Canada?
          </h2>
          <p className="text-green-100 text-xl mb-8 max-w-2xl mx-auto">
            Pay in GBP, USD, or CAD. Our concierge handles the rest — virtual tours, key handover, and full legal protection.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/diaspora"
              className="inline-flex items-center justify-center gap-2 bg-[#D4A017] text-gray-900 font-bold px-8 py-4 rounded-xl hover:bg-[#e5b832] transition-colors text-lg"
            >
              Learn more <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-white/15 border-2 border-white/30 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/25 transition-colors text-lg"
            >
              Get started free
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SECTION 9: FINAL CTA ────────────────────────────────────── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#0F7B5A]/10 text-[#0F7B5A] text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <Zap className="w-4 h-4" />
            Join 10,000+ Nigerians who trust SafeRent
          </div>
          <h2 className="text-5xl font-extrabold text-gray-900 mb-6">Ready to rent — safely?</h2>
          <p className="text-gray-500 text-lg mb-10">
            Create your free account today. No hidden fees, no advance payments, no fraud.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/listings"
              className="inline-flex items-center justify-center gap-2 bg-[#0F7B5A] text-white font-bold px-10 py-4 rounded-xl text-lg hover:bg-[#0a6049] transition-all shadow-lg shadow-[#0F7B5A]/25 hover:-translate-y-0.5"
            >
              Find a Home <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 border-2 border-gray-900 text-gray-900 font-bold px-10 py-4 rounded-xl text-lg hover:bg-gray-900 hover:text-white transition-all"
            >
              List Your Property
            </Link>
          </div>
          <p className="text-gray-400 text-sm mt-6">Free to join · No credit card required · Cancel anytime</p>
        </div>
      </section>

      {/* ─── PARTNERS BAR ─────────────────────────────────────────────── */}
      <section className="py-10 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">
            Trusted integrations &amp; partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {["Paystack", "Flutterwave", "Smile Identity", "Google Maps", "GTBank", "Zenith Bank"].map((p) => (
              <span key={p} className="text-sm font-bold text-gray-300 hover:text-gray-500 transition-colors cursor-pointer">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between gap-8 mb-12">
            <div className="max-w-xs">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-[#0F7B5A] rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-extrabold text-xl text-white">
                  Safe<span className="text-[#0F7B5A]">Rent</span>
                </span>
              </Link>
              <p className="text-sm text-gray-500 leading-relaxed">
                Nigeria&apos;s trust-first rental marketplace. Escrow-protected payments, BVN-verified landlords, legal agreements included.
              </p>
              <div className="flex items-center gap-2 mt-5">
                {[
                  { label: "Twitter/X", symbol: "𝕏" },
                  { label: "LinkedIn", symbol: "in" },
                  { label: "Instagram", symbol: "ig" },
                  { label: "WhatsApp", symbol: "wa" },
                ].map((s) => (
                  <button
                    key={s.label}
                    title={s.label}
                    className="w-8 h-8 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg flex items-center justify-center text-xs font-bold transition-colors"
                  >
                    {s.symbol}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden md:grid grid-cols-4 gap-8 flex-1 max-w-2xl text-sm">
              {[
                {
                  heading: "For Tenants",
                  links: [
                    { label: "Find a Home", href: "/listings" },
                    { label: "How Escrow Works", href: "/help" },
                    { label: "Trust Score", href: "/help" },
                    { label: "Diaspora Renting", href: "/diaspora" },
                  ],
                },
                {
                  heading: "For Landlords",
                  links: [
                    { label: "List Your Property", href: "/register?role=LANDLORD" },
                    { label: "Verification Badge", href: "/help" },
                    { label: "Tenant Screening", href: "/help" },
                    { label: "Pricing", href: "/help" },
                  ],
                },
                {
                  heading: "For Agents",
                  links: [
                    { label: "Agent Portal", href: "/register?role=AGENT" },
                    { label: "CRM Tools", href: "/help" },
                    { label: "Commission Tracking", href: "/help" },
                  ],
                },
                {
                  heading: "Company",
                  links: [
                    { label: "About SafeRent", href: "/" },
                    { label: "Market Data", href: "/market" },
                    { label: "Help Centre", href: "/help" },
                    { label: "Careers", href: "/" },
                  ],
                },
              ].map((col) => (
                <div key={col.heading}>
                  <div className="text-white font-semibold mb-4">{col.heading}</div>
                  <ul className="space-y-2.5">
                    {col.links.map((l) => (
                      <li key={l.label}>
                        <Link href={l.href} className="hover:text-white transition-colors">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <p>© 2026 SafeRent Technologies Ltd · All rights reserved · RC: 0000000</p>
            <div className="flex items-center gap-4">
              <Link href="/help" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/help" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/help" className="hover:text-white transition-colors">NDPA Compliance</Link>
            </div>
          </div>
          <p className="text-center mt-3 text-xs text-gray-600">
            Registered with LASRERA · CBN-licensed escrow · NDPA 2023 compliant
          </p>
        </div>
      </footer>
    </div>
  );
}
