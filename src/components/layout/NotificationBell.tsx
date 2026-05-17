"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, CheckCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { NotificationType } from "@prisma/client";

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

function typeIcon(type: NotificationType) {
  const cls = "w-4 h-4 shrink-0";
  switch (type) {
    case "RENT_DUE":
    case "INSTALLMENT_DUE":
      return <span className={cn(cls, "text-orange-500")}>💳</span>;
    case "MAINTENANCE_UPDATE":
      return <span className={cn(cls, "text-blue-500")}>🔧</span>;
    case "ESCROW_FUNDED":
    case "PAYOUT_SENT":
      return <span className={cn(cls, "text-green-500")}>💰</span>;
    case "DISPUTE_RAISED":
    case "DISPUTE_RESOLVED":
      return <span className={cn(cls, "text-red-500")}>⚖️</span>;
    case "VIEWING_CONFIRMED":
    case "VIEWING_REMINDER":
      return <span className={cls}>📅</span>;
    case "LEASE_RENEWAL_REMINDER":
      return <span className={cls}>📄</span>;
    default:
      return <span className={cls}>🔔</span>;
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications?limit=5");
      const data = await res.json() as {
        notifications?: NotificationItem[];
        unreadCount?: number;
      };
      if (data.notifications) {
        setNotifications(data.notifications.slice(0, 5));
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const markOneRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-30 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-[#0F7B5A] hover:underline"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex gap-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer",
                    !n.isRead && "bg-green-50/50"
                  )}
                  onClick={() => {
                    if (!n.isRead) markOneRead(n.id);
                    setOpen(false);
                  }}
                >
                  {!n.isRead && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0F7B5A] mt-2 shrink-0" />
                  )}
                  {n.isRead && <div className="w-1.5 shrink-0" />}
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className="mt-0.5">{typeIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs font-semibold text-gray-900 leading-snug", !n.isRead && "font-bold")}>
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 leading-snug mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-gray-100 px-4 py-2.5">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-xs text-[#0F7B5A] font-medium hover:underline"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
