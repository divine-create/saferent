import Link from "next/link";
import { Shield, CheckCircle, Star } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — green brand side (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] bg-gradient-to-br from-[#0F7B5A] via-[#0a6049] to-[#084d3a] flex-col justify-between p-10 relative overflow-hidden shrink-0">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[#D4A017]/15 blur-2xl pointer-events-none" />

        {/* Top: Logo */}
        <Link href="/" className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl text-white tracking-tight">SafeRent</span>
        </Link>

        {/* Middle: Heading + trust points */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold text-white leading-tight mb-3">
              Nigeria&apos;s safest way to rent
            </h2>
            <p className="text-green-200 text-base leading-relaxed">
              Join thousands of Nigerians renting with confidence — escrow-protected, BVN-verified, legally sound.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: <CheckCircle className="w-5 h-5 text-[#D4A017]" />, title: "CBN-Licensed Escrow", desc: "Your rent is held safely until you move in" },
              { icon: <CheckCircle className="w-5 h-5 text-[#D4A017]" />, title: "BVN-Verified Landlords", desc: "Every landlord is identity-verified before listing" },
              { icon: <CheckCircle className="w-5 h-5 text-[#D4A017]" />, title: "Legal Agreement Included", desc: "Proper tenancy agreement at ₦8,000 flat fee" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">{item.icon}</div>
                <div>
                  <p className="text-white font-semibold text-sm">{item.title}</p>
                  <p className="text-green-300 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 rounded-2xl p-5 border border-white/15">
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#D4A017] text-[#D4A017]" />
              ))}
            </div>
            <p className="text-green-100 text-sm italic leading-relaxed mb-4">
              &ldquo;I paid from London and my flat was ready on arrival. SafeRent&apos;s escrow gave me complete peace of mind.&rdquo;
            </p>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white text-xs font-bold">AO</span>
              </div>
              <div>
                <p className="text-white text-xs font-bold">Adaeze O.</p>
                <p className="text-green-300 text-xs">Tenant · Lagos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Stats */}
        <div className="flex items-center gap-6 relative z-10">
          <div>
            <p className="text-white font-extrabold text-lg">2,847</p>
            <p className="text-green-300 text-xs">Verified listings</p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div>
            <p className="text-white font-extrabold text-lg">4.8★</p>
            <p className="text-green-300 text-xs">Average rating</p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div>
            <p className="text-white font-extrabold text-lg">₦4.2B+</p>
            <p className="text-green-300 text-xs">In escrow</p>
          </div>
        </div>
      </div>

      {/* Right panel — form side */}
      <div className="flex-1 flex flex-col min-h-screen bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden px-6 py-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-8 h-8 bg-[#0F7B5A] rounded-xl flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-xl">
              <span className="text-[#0F7B5A]">Safe</span><span className="text-gray-900">Rent</span>
            </span>
          </Link>
        </div>

        {/* Form content */}
        <main className="flex-1 flex items-start lg:items-center justify-center px-6 py-8 lg:py-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-gray-100">
          <p className="text-xs text-center text-gray-400">
            © 2026 SafeRent Technologies Ltd · Registered with LASRERA · NDPA 2023 compliant
          </p>
        </footer>
      </div>
    </div>
  );
}
