"use client";

import { cn } from "@/lib/utils";
import { MockConversation } from "@/lib/mock-conversations";

interface ConversationItemProps {
  conversation: MockConversation;
  currentUserId: string;
  isActive: boolean;
  onClick: () => void;
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return date.toLocaleDateString("en-NG", { weekday: "short" });
  }
  return date.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

function getInitials(firstName: string | null, lastName: string | null): string {
  const f = (firstName ?? "").charAt(0).toUpperCase();
  const l = (lastName ?? "").charAt(0).toUpperCase();
  return (f + l) || "?";
}

export function ConversationItem({
  conversation,
  currentUserId,
  isActive,
  onClick,
}: ConversationItemProps) {
  const isTenant = conversation.tenantId === currentUserId;
  const otherParty = isTenant ? conversation.owner : conversation.tenant;
  const unreadCount = isTenant ? conversation.tenantUnread : conversation.ownerUnread;

  const otherName =
    [otherParty.firstName, otherParty.lastName].filter(Boolean).join(" ") || "Unknown";
  const initials = getInitials(otherParty.firstName, otherParty.lastName);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 flex items-start gap-3 transition-all border-l-2 hover:bg-gray-50",
        isActive
          ? "border-l-[#0F7B5A] bg-green-50/60"
          : "border-l-transparent"
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-full bg-[#0F7B5A]/10 flex items-center justify-center text-sm font-bold text-[#0F7B5A]">
          {initials}
        </div>
        {/* Offline indicator */}
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-gray-300 border-2 border-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={cn("text-sm truncate", unreadCount > 0 ? "font-bold text-gray-900" : "font-semibold text-gray-800")}>
            {otherName}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            {unreadCount > 0 && (
              <span className="bg-[#0F7B5A] text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {unreadCount}
              </span>
            )}
            <span className="text-xs text-gray-400">
              {formatRelativeTime(conversation.lastMessageAt)}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">
          {conversation.listing.area} · {conversation.listing.title}
        </p>
        <p className={cn("text-xs mt-0.5 truncate", unreadCount > 0 ? "text-gray-700 font-medium" : "text-gray-400")}>
          {conversation.lastMessageText ?? "No messages yet"}
        </p>
      </div>
    </button>
  );
}
