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
    ? `/${session.user.role.toLowerCase()}`
    : "/";

  const roleLabel = {
    TENANT: "Tenant",
    LANDLORD: "Landlord",
    AGENT: "Agent",
    ADMIN: "Admin",
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0F7B5A] rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">
              Safe<span className="text-[#0F7B5A]">Rent</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {!session && (
              <>
                <Link href="/#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  How it works
                </Link>
                <Link href="/#for-landlords" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  For Landlords
                </Link>
                <Link href="/#for-agents" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  For Agents
                </Link>
              </>
            )}
          </div>

          {/* Auth Area */}
          <div className="flex items-center gap-3">
            {session && (
              <>
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
                  className="flex items-center gap-2.5 rounded-full bg-gray-50 hover:bg-gray-100 px-3 py-1.5 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[#0F7B5A] flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {session.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-gray-800 leading-none">
                      {session.user?.name ?? "User"}
                    </p>
                    <p className="text-xs text-gray-500">
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
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white border border-gray-200 shadow-lg z-20 overflow-hidden">
                      <div className="p-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">
                          {session.user?.name ?? "User"}
                        </p>
                        <p className="text-xs text-gray-500">{session.user?.email}</p>
                        {session.user?.trustScore !== undefined && (
                          <div className="mt-2">
                            <TrustScorePill score={session.user.trustScore} />
                          </div>
                        )}
                      </div>
                      <div className="py-1">
                        <Link
                          href={dashboardPath}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <LayoutDashboard className="w-4 h-4 text-gray-400" />
                          Dashboard
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Settings className="w-4 h-4 text-gray-400" />
                          Settings
                        </Link>
                        <button
                          onClick={() => { signOut({ callbackUrl: "/" }); setDropdownOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
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
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 hidden sm:block transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium bg-[#0F7B5A] text-white px-4 py-2 rounded-lg hover:bg-[#0a6049] transition-colors"
                >
                  Get started
                </Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {!session && (
              <>
                <Link href="/#how-it-works" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>How it works</Link>
                <Link href="/#for-landlords" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>For Landlords</Link>
                <Link href="/#for-agents" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>For Agents</Link>
              </>
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
