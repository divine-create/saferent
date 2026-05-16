"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  AlertTriangle,
  ShieldCheck,
  BarChart3,
  Settings,
  Shield,
  ExternalLink,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/listings", label: "Listings", icon: Building2 },
  { href: "/admin/transactions", label: "Transactions", icon: CreditCard },
  { href: "/admin/disputes", label: "Disputes", icon: AlertTriangle },
  { href: "/admin/verification", label: "Verification Queue", icon: ShieldCheck },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/config", label: "Configuration", icon: Settings },
];

export function AdminSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-gray-900 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#0F7B5A] rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg text-white">
              Safe<span className="text-[#0F7B5A]">Rent</span>
            </span>
            <span className="block text-xs text-gray-400 -mt-0.5">Admin Console</span>
          </div>
        </div>
      </div>

      {/* Admin user info */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#0F7B5A]/20 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-[#0F7B5A]">
              {session?.user?.name?.charAt(0)?.toUpperCase() ?? "A"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {session?.user?.name ?? "Admin"}
            </p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {adminNav.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-[#0F7B5A] text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0",
                  isActive ? "text-white" : "text-gray-500"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Back to site */}
      <div className="p-4 border-t border-gray-700">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Back to site
        </Link>
      </div>
    </aside>
  );
}
