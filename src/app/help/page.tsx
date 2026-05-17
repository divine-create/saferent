"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, Search, ChevronDown, ChevronRight, MessageCircle, BookOpen, CreditCard, Home, Scale, User, AlertTriangle } from "lucide-react";

const CATEGORIES = [
  { icon: <BookOpen className="w-5 h-5 text-[#0F7B5A]" />, title: "Getting Started", count: 8, bg: "bg-green-50" },
  { icon: <CreditCard className="w-5 h-5 text-blue-600" />, title: "Payments & Escrow", count: 12, bg: "bg-blue-50" },
  { icon: <Home className="w-5 h-5 text-purple-600" />, title: "Listings", count: 10, bg: "bg-purple-50" },
  { icon: <Scale className="w-5 h-5 text-[#D4A017]" />, title: "Agreements", count: 6, bg: "bg-yellow-50" },
  { icon: <AlertTriangle className="w-5 h-5 text-red-500" />, title: "Disputes", count: 7, bg: "bg-red-50" },
  { icon: <User className="w-5 h-5 text-gray-600" />, title: "Account & Verification", count: 9, bg: "bg-gray-50" },
];

const ARTICLES = [
  {
    question: "How does SafeRent escrow work?",
    answer: "When you pay rent through SafeRent, your money is held in a CBN-licensed escrow account — not transferred directly to the landlord. The funds are only released to the landlord after you physically confirm your move-in in the SafeRent app. This means if the property isn't as described or you can't access it, your money is protected until the issue is resolved.",
  },
  {
    question: "What documents do I need to verify my property?",
    answer: "Landlords need to submit: (1) Title document — Certificate of Occupancy (C of O), Deed of Assignment, or Governor's Consent. (2) A recent utility bill in your name showing the property address. (3) A clear selfie holding your government-issued ID. Once reviewed by our team, you'll receive a verification badge — from ID Verified up to SafeRent Certified Gold.",
  },
  {
    question: "How do I raise a dispute?",
    answer: "If there's a problem after you've paid (property not as described, can't get access, major defect, etc.), go to your transaction, click 'Raise Dispute', select the category, describe the issue and upload evidence (photos, videos, messages). SafeRent will freeze the escrow and assign a mediator within 24 hours. Most disputes are resolved within 7 days.",
  },
  {
    question: "What is a trust score?",
    answer: "Your trust score (0–100) is a credibility rating that builds over time. It starts at 0 and increases as you verify your identity (BVN, phone, email, ID document), complete successful transactions, and receive positive reviews. A higher score unlocks more features — like installment payment plans (requires 80+) and priority listing placement.",
  },
  {
    question: "How do rent installments work?",
    answer: "If your trust score is 80 or above, you can apply to pay your rent in monthly installments instead of a lump sum. SafeRent pays the landlord the full annual rent upfront via escrow, and you repay SafeRent monthly with a small interest charge. Your monthly debit day is chosen by you during setup. Missing payments affects your trust score.",
  },
  {
    question: "I'm renting from abroad — where do I start?",
    answer: "Visit our Diaspora page at /diaspora. You can browse listings with prices in USD, GBP, EUR, or CAD. For peace of mind, book the SafeRent Concierge (₦50,000) — a vetted SafeRent staff member will physically inspect the property, do a live video walkthrough with you, and oversee key handover. International card payments are accepted.",
  },
];

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredArticles = ARTICLES.filter(
    (a) =>
      !search ||
      a.question.toLowerCase().includes(search.toLowerCase()) ||
      a.answer.toLowerCase().includes(search.toLowerCase())
  );

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
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-[#0F7B5A]">Sign In</Link>
            <Link href="/register" className="bg-[#0F7B5A] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#0a6049]">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white py-16 px-4 border-b border-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Help Centre</h1>
          <p className="text-gray-500 text-lg mb-8">Find answers to your questions about SafeRent</p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search help articles…"
              className="w-full pl-12 pr-4 py-4 text-base border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0F7B5A] shadow-sm"
            />
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Category cards */}
        {!search && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {CATEGORIES.map((cat) => (
                <button key={cat.title} className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-[#0F7B5A]/30 hover:shadow-md transition-all text-left">
                  <div className={`w-10 h-10 ${cat.bg} rounded-xl flex items-center justify-center shrink-0`}>
                    {cat.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{cat.title}</p>
                    <p className="text-xs text-gray-400">{cat.count} articles</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Featured articles */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-5">
            {search ? `Results for "${search}"` : "Featured Articles"}
          </h2>
          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-2">No articles found for &ldquo;{search}&rdquo;</p>
              <p className="text-sm text-gray-400">Try a different search term or browse categories above.</p>
            </div>
          )}
          <div className="space-y-2">
            {filteredArticles.map((article, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50/50 transition-colors"
                >
                  <span className="font-semibold text-gray-800 text-sm pr-4">{article.question}</span>
                  {openIndex === i ? (
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                </button>
                {openIndex === i && (
                  <div className="px-5 pb-5 border-t border-gray-50">
                    <p className="text-sm text-gray-600 leading-relaxed mt-4">{article.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact support */}
        <div className="mt-12 bg-[#0F7B5A]/5 border border-[#0F7B5A]/20 rounded-2xl p-8 text-center">
          <MessageCircle className="w-10 h-10 text-[#0F7B5A] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Can&apos;t find what you need?</h3>
          <p className="text-gray-500 mb-5">Our support team typically responds within 2 hours.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/2348000000000"
              className="inline-flex items-center justify-center gap-2 bg-[#0F7B5A] text-white font-medium px-6 py-3 rounded-xl hover:bg-[#0a6049] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Chat with us on WhatsApp
            </a>
            <a
              href="mailto:support@saferent.ng"
              className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Email support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
