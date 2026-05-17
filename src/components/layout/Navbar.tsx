"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { TrustScorePill } from "@/components/trust/TrustScoreBadge";
import {
  LogOut,
  Settings,
  LayoutDashboard,
  Menu,
  X,
  Shield,
  MessageCircle,
} from "lucide-react";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { CurrencySelector } from "@/components/diaspora/CurrencySelector";

export function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchUnread = () => {
      fetch("/api/conversations/unread")
        .then((r) => r.json())
        .then((d: { unread?: number }) => setUnreadCount(d.unread ?? 0))
        .catch(() => {/* ignore */});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  const dashboardPath = session?.user?.role
    ? session.user.role === "DEVELOPER"
      ? "/developer"
      : `/${session.user.role.toLowerCase()}`
    : "/";

  const roleLabel: Record<string, string> = {
    TENANT: "Tenant",
    LANDLORD: "Landlord",
    AGENT: "Agent",
    ADMIN: "Admin",
    DEVELOPER: "Developer",
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-[#0F7B5A] rounded-xl flex items-center justify-center shadow-sm shadow-[#0F7B5A]/30">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">
              <span className="text-[#0F7B5A]">Safe</span><span className="text-gray-900">Rent</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {!session && (
              <>
                <Link href="/listings" className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all">
                  Listings
                </Link>
                <Link href="/market" className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all">
                  Market Data
                </Link>
                <Link href="/#for-agents" className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all">
                  For Agents
                </Link>
                <Link href="/diaspora" className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all">
                  Diaspora
                </Link>
              </>
            )}
            {session && (
              <>
                <Link href="/listings" className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all">
                  Listings
                </Link>
                <Link href="/market" className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all">
                  Market Data
                </Link>
              </>
            )}
          </div>

          {/* Auth Area */}
          <div className="flex items-center gap-2">
            {session && (
              <>
                <CurrencySelector />
                <NotificationBell />
                <Link
                  href="/messages"
                  className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Messages"
                >
                  <MessageCircle className="w-5 h-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              </>
            )}
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 pl-2 pr-3 py-1.5 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-[#0F7B5A] flex items-center justify-center shadow-sm">
                    <span className="text-white text-xs font-bold">
                      {session.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-gray-800 leading-none">
                      {session.user?.name?.split(" ")[0] ?? "User"}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {roleLabel[session.user?.role ?? "TENANT"]}
                    </p>
                  </div>
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl bg-white border border-gray-200 shadow-xl z-20 overflow-hidden">
                      <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <p className="text-sm font-bold text-gray-900">
                          {session.user?.name ?? "User"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{session.user?.email}</p>
                        {session.user?.trustScore !== undefined && (
                          <div className="mt-2.5">
                            <TrustScorePill score={session.user.trustScore} />
                          </div>
                        )}
                      </div>
                      <div className="py-1.5">
                        <Link
                          href={dashboardPath}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                        >
                          <LayoutDashboard className="w-4 h-4 text-gray-400" />
                          Dashboard
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                        >
                          <Settings className="w-4 h-4 text-gray-400" />
                          Settings
                        </Link>
                        <div className="h-px bg-gray-100 mx-2 my-1" />
                        <button
                          onClick={() => { signOut({ callbackUrl: "/" }); setDropdownOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-gray-700 hover:text-gray-900 hidden sm:block px-3 py-2 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-bold bg-[#0F7B5A] text-white px-4 py-2 rounded-xl hover:bg-[#0a6049] transition-all shadow-sm shadow-[#0F7B5A]/20"
                >
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors ml-1"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
            <Link href="/listings" className="flex items-center px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl" onClick={() => setMenuOpen(false)}>Listings</Link>
            <Link href="/market" className="flex items-center px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl" onClick={() => setMenuOpen(false)}>Market Data</Link>
            <Link href="/#for-agents" className="flex items-center px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl" onClick={() => setMenuOpen(false)}>For Agents</Link>
            <Link href="/diaspora" className="flex items-center px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl" onClick={() => setMenuOpen(false)}>Diaspora</Link>
            {!session && (
              <div className="flex gap-3 px-4 pt-3 pb-1">
                <Link href="/login" className="flex-1 text-center py-2.5 border-2 border-gray-200 text-gray-800 font-bold rounded-xl text-sm hover:border-gray-300 transition-colors" onClick={() => setMenuOpen(false)}>Log in</Link>
                <Link href="/register" className="flex-1 text-center py-2.5 bg-[#0F7B5A] text-white font-bold rounded-xl text-sm hover:bg-[#0a6049] transition-colors" onClick={() => setMenuOpen(false)}>Get Started</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

// Simple usage wrapper
export function NavbarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn("min-h-screen bg-gray-50")}>
      <Navbar />
      {children}
    </div>
  );
}
