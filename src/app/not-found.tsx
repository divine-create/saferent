import Link from "next/link";
import { Shield, ArrowRight, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F7B5A]/5 via-white to-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-[#0F7B5A] rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">SafeRent</span>
        </Link>

        <div className="text-8xl font-extrabold text-[#0F7B5A]/20 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Page not found</h1>
        <p className="text-gray-500 text-lg mb-8">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-[#0F7B5A] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#0a6049] transition-colors"
          >
            Go to Homepage
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/listings"
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Search className="w-4 h-4" />
            Browse Listings
          </Link>
        </div>
      </div>
    </div>
  );
}
