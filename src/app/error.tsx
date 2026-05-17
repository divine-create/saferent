"use client";

import Link from "next/link";
import { Shield, RefreshCcw, MessageCircle } from "lucide-react";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/50 via-white to-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-[#0F7B5A] rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">SafeRent</span>
        </Link>

        <div className="text-8xl font-extrabold text-red-100 mb-4">500</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Something went wrong</h1>
        <p className="text-gray-500 text-lg mb-3">
          We&apos;re sorry — an unexpected error occurred. Our team has been notified.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-8 font-mono bg-gray-100 rounded-lg px-3 py-1.5 inline-block">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-[#0F7B5A] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#0a6049] transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </button>
          <a
            href="mailto:support@saferent.ng"
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Contact Support
          </a>
        </div>
        <p className="mt-6 text-sm text-gray-400">
          Or <Link href="/" className="text-[#0F7B5A] hover:underline">return to homepage</Link>
        </p>
      </div>
    </div>
  );
}
