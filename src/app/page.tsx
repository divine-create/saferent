import Link from "next/link";
import { Shield, CheckCircle, FileText, MapPin, Star, ArrowRight, Lock, Users, Building, Globe, Video, CreditCard } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0F7B5A] rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SafeRent</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <Link href="/listings" className="hover:text-[#0F7B5A] transition-colors">Find a Home</Link>
            <Link href="/how-it-works" className="hover:text-[#0F7B5A] transition-colors">How It Works</Link>
            <Link href="/landlords" className="hover:text-[#0F7B5A] transition-colors">For Landlords</Link>
            <Link href="/agents" className="hover:text-[#0F7B5A] transition-colors">For Agents</Link>
            <Link href="/market" className="hover:text-[#0F7B5A] transition-colors">Market Data</Link>
            <Link href="/diaspora" className="hover:text-[#0F7B5A] transition-colors">Diaspora</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-[#0F7B5A] transition-colors">
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-[#0F7B5A] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#0a6049] transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0F7B5A] via-[#0a6049] to-[#084d3a] text-white pt-20 pb-28 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Shield className="w-4 h-4" />
            Nigeria&apos;s only escrow-protected rental marketplace
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            Rent a home in Nigeria —<br />
            <span className="text-[#F5C842]">safely.</span>
          </h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto mb-10">
            No more paying rent to fraudsters. SafeRent holds your money in escrow until you physically confirm
            your move-in — guaranteed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register?role=TENANT"
              className="bg-[#F5C842] text-gray-900 font-bold px-8 py-4 rounded-xl text-lg hover:bg-[#e5b832] transition-colors shadow-lg"
            >
              Find a Home
            </Link>
            <Link
              href="/register?role=LANDLORD"
              className="bg-white/10 border-2 border-white/30 text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-white/20 transition-colors"
            >
              List Your Property
            </Link>
          </div>
          <div className="flex items-center justify-center gap-8 mt-12 text-green-200 text-sm">
            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4" />BVN Verified Listings</div>
            <div className="flex items-center gap-2"><Lock className="w-4 h-4" />Escrow Protected</div>
            <div className="flex items-center gap-2"><FileText className="w-4 h-4" />Legal Agreement ₦8k flat</div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-[#0F7B5A] py-6">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { value: "2,847", label: "Listings" },
            { value: "₦4.2B", label: "Secured in Escrow" },
            { value: "1,203", label: "Families Housed" },
            { value: "4.8★", label: "Average Rating" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-extrabold text-white">{stat.value}</div>
              <div className="text-green-200 text-xs mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured listings */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Verified Listings</h2>
              <p className="text-gray-500 text-sm mt-0.5">Hand-picked properties with full verification</p>
            </div>
            <Link href="/listings" className="text-[#0F7B5A] font-semibold text-sm hover:underline hidden md:block">
              Browse all →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { title: "3-Bed Flat, Lekki Phase 1", area: "Lekki Phase 1, Lagos", rent: "₦4,500,000", beds: 3, baths: 3, type: "Flat" },
              { title: "2-Bed Flat, Ikeja GRA", area: "Ikeja GRA, Lagos", rent: "₦2,400,000", beds: 2, baths: 2, type: "Flat" },
              { title: "3-Bed Duplex, Maitama", area: "Maitama, Abuja", rent: "₦5,200,000", beds: 3, baths: 3, type: "Duplex" },
            ].map((listing) => (
              <Link
                key={listing.title}
                href="/listings"
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="h-44 bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center relative">
                  <Building className="w-12 h-12 text-[#0F7B5A]/20" />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 bg-[#0F7B5A] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-1">{listing.type} · {listing.beds} bed · {listing.baths} bath</p>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-[#0F7B5A]">{listing.title}</h3>
                  <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{listing.area}
                  </p>
                  <p className="text-lg font-bold text-gray-900">{listing.rent} <span className="text-xs text-gray-400 font-normal">p.a.</span></p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/listings" className="inline-flex items-center gap-2 bg-[#0F7B5A] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#0a6049] transition-colors">
              Browse all listings <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Old Stats section — now trust stats */}
      <section className="bg-gray-50 py-12 border-b">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-3 gap-8 text-center">
          {[
            { value: "0% fraud", label: "Confirmed fraud rate on SafeRent escrow transactions" },
            { value: "₦8,000", label: "Flat legal agreement fee vs. 10% agent legal fee" },
            { value: "72hrs", label: "Dispute resolution SLA — funds frozen until resolved" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-extrabold text-[#0F7B5A]">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How SafeRent works</h2>
            <p className="text-gray-500 text-lg">Four steps from search to keys in hand</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: 1, icon: <MapPin className="w-6 h-6" />, title: "Search & discover", desc: "Browse verified listings across Lagos, Abuja, and beyond. Filter by location, price, and amenities." },
              { step: 2, icon: <Shield className="w-6 h-6" />, title: "Verify & apply", desc: "BVN verification protects both sides. Landlords are verified, tenants are screened — no surprises." },
              { step: 3, icon: <Lock className="w-6 h-6" />, title: "Pay via escrow", desc: "Your rent is held securely in a CBN-licensed escrow account. The landlord gets paid only after you move in." },
              { step: 4, icon: <CheckCircle className="w-6 h-6" />, title: "Move in safely", desc: "Confirm move-in in the app, sign your digital tenancy agreement, and receive your keys — legally protected." },
            ].map((item) => (
              <div key={item.step} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm relative">
                <div className="absolute -top-3 -left-3 w-7 h-7 bg-[#0F7B5A] text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {item.step}
                </div>
                <div className="w-12 h-12 bg-green-50 text-[#0F7B5A] rounded-xl flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For each user type */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Built for every side of the market</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Users className="w-6 h-6 text-[#0F7B5A]" />,
                title: "Tenants",
                color: "border-[#0F7B5A]",
                benefits: [
                  "Escrow protects your payment until move-in",
                  "Standard legal agreement — ₦8,000 flat",
                  "Monthly installment option (trust score 80+)",
                  "Dispute resolution within 7 days",
                  "Tenant trust score builds over time",
                ],
                cta: "Find a Home →",
                href: "/register?role=TENANT",
              },
              {
                icon: <Building className="w-6 h-6 text-[#D4A017]" />,
                title: "Landlords",
                color: "border-[#D4A017]",
                benefits: [
                  "Receive full payment before tenant moves in",
                  "BVN-verified, screened tenant profiles",
                  "Digital tenancy agreement, signed in-app",
                  "SafeRent Certified Gold badge for verified owners",
                  "End-to-end payout tracking",
                ],
                cta: "List Your Property →",
                href: "/register?role=LANDLORD",
              },
              {
                icon: <Star className="w-6 h-6 text-blue-600" />,
                title: "Agents",
                color: "border-blue-600",
                benefits: [
                  "Verified professional profile with LASRERA badge",
                  "Multi-property listing tools and CSV import",
                  "Client CRM with enquiry pipeline",
                  "Commission tracking and auto-invoicing",
                  "Pro Agent badge for top 10% performers",
                ],
                cta: "Join as Agent →",
                href: "/register?role=AGENT",
              },
            ].map((card) => (
              <div key={card.title} className={`bg-white rounded-2xl border-t-4 ${card.color} p-6 shadow-sm`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                    {card.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{card.title}</h3>
                </div>
                <ul className="space-y-2 mb-6">
                  {card.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link href={card.href} className="text-[#0F7B5A] font-semibold text-sm hover:underline flex items-center gap-1">
                  {card.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Trusted by thousands of Nigerians</h2>
            <p className="text-gray-500">Real stories from tenants, landlords, and agents</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Chidi O.",
                role: "Tenant, Lagos",
                quote: "I paid from London and my flat was ready on arrival. The escrow gave me total peace of mind.",
                avatar: "C",
                rating: 5,
              },
              {
                name: "Folake A.",
                role: "Landlord, Abuja",
                quote: "My tenant&apos;s BVN was verified before I handed over keys. First time I&apos;ve felt safe renting out.",
                avatar: "F",
                rating: 5,
              },
              {
                name: "Emeka J.",
                role: "Agent, Lagos",
                quote: "The CRM and listing tools save me 3 hours a day. My conversion rate doubled.",
                avatar: "E",
                rating: 5,
              },
            ].map((t) => (
              <div key={t.name} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#D4A017] text-[#D4A017]" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#0F7B5A] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Diaspora section */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#0F7B5A] to-[#084d3a] text-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                <Globe className="w-4 h-4" />
                For the Diaspora
              </div>
              <h2 className="text-3xl font-bold mb-4">Renting from abroad? We&apos;ve got you.</h2>
              <p className="text-green-100 mb-8 text-lg">Find your home in Nigeria without leaving your city. Pay in your currency, we handle the rest.</p>
              <Link
                href="/diaspora"
                className="inline-flex items-center gap-2 bg-[#F5C842] text-gray-900 font-bold px-6 py-3 rounded-xl hover:bg-[#e5b832] transition-colors"
              >
                Explore Diaspora Features <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { icon: <CreditCard className="w-5 h-5" />, title: "Pay in USD, GBP, or EUR", desc: "International cards accepted. Settlement in NGN via CBN-licensed escrow." },
                { icon: <Video className="w-5 h-5" />, title: "Virtual Viewing", desc: "Live video walkthrough with your landlord, recorded and stored." },
                { icon: <MapPin className="w-5 h-5" />, title: "Concierge Key Handover", desc: "SafeRent staff physically inspects and oversees handover on your behalf." },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 bg-white/10 rounded-xl p-4">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-0.5">{item.title}</p>
                    <p className="text-green-200 text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partners bar */}
      <section className="py-10 px-4 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs text-gray-400 font-semibold uppercase tracking-widest mb-6">Trusted integrations &amp; partners</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {["Paystack", "Flutterwave", "Smile Identity", "Google Maps", "GTBank", "Zenith Bank"].map((partner) => (
              <span key={partner} className="text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[#0F7B5A] rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg">SafeRent</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm mb-10">
            {[
              { heading: "Platform", links: ["Find a Home", "List Property", "How It Works", "Pricing"] },
              { heading: "Trust & Safety", links: ["Escrow Explained", "Verification", "Dispute Resolution", "BVN Privacy"] },
              { heading: "Company", links: ["About SafeRent", "Blog", "Careers", "Press"] },
              { heading: "Legal", links: ["Terms of Service", "Privacy Policy", "NDPA Compliance", "Cookie Policy"] },
            ].map((col) => (
              <div key={col.heading}>
                <div className="text-white font-semibold mb-3">{col.heading}</div>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l}><span className="hover:text-white cursor-pointer transition-colors">{l}</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <p>© 2026 SafeRent Technologies Ltd. All rights reserved. RC: 0000000</p>
            <p>Registered with LASRERA · CBN-licensed escrow · NDPA 2023 compliant</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
