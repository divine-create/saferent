"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Home,
  FileText,
  CreditCard,
  Calendar,
  Building2,
  Users,
  BarChart3,
  MessageSquare,
  Settings,
  Shield,
  Star,
  Briefcase,
  UserCheck,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tenantNav: NavItem[] = [
  { href: "/tenant", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tenant/listings", label: "Find a Home", icon: Home },
  { href: "/tenant/viewings", label: "My Viewings", icon: Calendar },
  { href: "/tenant/applications", label: "Applications", icon: FileText },
  { href: "/tenant/payments", label: "Payments", icon: CreditCard },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/tenant/settings", label: "Settings", icon: Settings },
];

const landlordNav: NavItem[] = [
  { href: "/landlord", label: "Dashboard", icon: LayoutDashboard },
  { href: "/landlord/properties", label: "My Properties", icon: Building2 },
  { href: "/landlord/applications", label: "Applications", icon: FileText },
  { href: "/landlord/tenants", label: "Tenants", icon: Users },
  { href: "/landlord/payments", label: "Payments", icon: CreditCard },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/landlord/settings", label: "Settings", icon: Settings },
];

const agentNav: NavItem[] = [
  { href: "/agent", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agent/listings", label: "Listings", icon: Building2 },
  { href: "/agent/crm", label: "CRM / Leads", icon: Users },
  { href: "/agent/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/agent/clients", label: "Clients", icon: UserCheck },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/agent/subscription", label: "Subscription", icon: Star },
  { href: "/agent/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = session?.user?.role ?? "TENANT";

  const navItems =
    role === "TENANT" ? tenantNav : role === "LANDLORD" ? landlordNav : agentNav;

  const roleIcons = {
    TENANT: Shield,
    LANDLORD: Briefcase,
    AGENT: Star,
    ADMIN: Settings,
  };

  const RoleIcon = roleIcons[role];

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo area */}
      <div className="p-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#0F7B5A] rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">
            Safe<span className="text-[#0F7B5A]">Rent</span>
          </span>
        </Link>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#0F7B5A]/10 flex items-center justify-center">
            <RoleIcon className="w-5 h-5 text-[#0F7B5A]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {session?.user?.name ?? "User"}
            </p>
            <p className="text-xs text-gray-500 capitalize">{role.toLowerCase()}</p>
          </div>
        </div>
        {session?.user?.trustScore !== undefined && (
          <div className="mt-2.5 bg-gray-50 rounded-lg px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Trust Score</span>
              <span className="text-xs font-bold text-[#0F7B5A]">
                {session.user.trustScore}/100
              </span>
            </div>
            <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0F7B5A] rounded-full transition-all duration-500"
                style={{ width: `${session.user.trustScore}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== `/${role.toLowerCase()}` && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-[#0F7B5A]/10 text-[#0F7B5A]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-[#0F7B5A]" : "text-gray-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <p className="text-xs text-center text-gray-400">
          © 2025 SafeRent Nigeria
        </p>
      </div>
    </aside>
  );
}
