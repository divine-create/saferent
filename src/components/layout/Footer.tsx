import Link from "next/link";
import { Shield } from "lucide-react";

const LINKS = {
  "For Tenants": [
    { label: "Find a Home", href: "/listings" },
    { label: "How Escrow Works", href: "/help" },
    { label: "Trust Score", href: "/help" },
    { label: "Installment Plans", href: "/help" },
    { label: "Diaspora Renting", href: "/diaspora" },
  ],
  "For Landlords": [
    { label: "List Your Property", href: "/register?role=LANDLORD" },
    { label: "Verification Badge", href: "/help" },
    { label: "Tenant Screening", href: "/help" },
    { label: "Pricing", href: "/help" },
  ],
  "For Agents": [
    { label: "Agent Portal", href: "/register?role=AGENT" },
    { label: "Agent Directory", href: "/agents" },
    { label: "CRM Tools", href: "/help" },
    { label: "Commission Tracking", href: "/help" },
  ],
  Company: [
    { label: "About SafeRent", href: "/" },
    { label: "Market Data", href: "/market" },
    { label: "Help Centre", href: "/help" },
    { label: "Careers", href: "/" },
    { label: "Press", href: "/" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-14 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Logo + tagline */}
        <div className="flex items-start justify-between gap-8 mb-10">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-[#0F7B5A] rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-lg">SafeRent</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Nigeria&apos;s trust-first rental marketplace. Escrow-protected payments, BVN-verified landlords, legal agreements.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-4">
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

          {/* Links */}
          <div className="hidden md:grid grid-cols-4 gap-8 flex-1 max-w-2xl text-sm">
            {Object.entries(LINKS).map(([heading, links]) => (
              <div key={heading}>
                <div className="text-white font-semibold mb-3">{heading}</div>
                <ul className="space-y-2">
                  {links.map((l) => (
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

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© 2026 SafeRent Technologies Ltd · All rights reserved · RC: 0000000</p>
          <div className="flex items-center gap-4">
            <Link href="/help" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/help" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/help" className="hover:text-white transition-colors">NDPA Compliance</Link>
          </div>
        </div>
        <div className="text-center mt-3 text-xs text-gray-600">
          Registered with LASRERA · CBN-licensed escrow · NDPA 2023 compliant
        </div>
      </div>
    </footer>
  );
}
