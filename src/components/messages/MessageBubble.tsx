"use client";

import { cn } from "@/lib/utils";
import { MockMessage } from "@/lib/mock-conversations";

interface MessageBubbleProps {
  message: MockMessage;
  currentUserId: string;
  isLastSent: boolean;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function MessageBubble({ message, currentUserId, isLastSent }: MessageBubbleProps) {
  // System messages
  if (message.type === "SYSTEM") {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-gray-400 italic bg-gray-100 rounded-full px-3 py-1 max-w-xs text-center">
          {message.content}
        </span>
      </div>
    );
  }

  const isSent = message.senderId === currentUserId;

  return (
    <div className={cn("flex", isSent ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[75%] sm:max-w-[60%] flex flex-col gap-0.5", isSent ? "items-end" : "items-start")}>
        <div
          className={cn(
            "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
            isSent
              ? "bg-[#0F7B5A] text-white rounded-br-sm"
              : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm"
          )}
        >
          {message.content}
        </div>

        <div className={cn("flex items-center gap-1 px-1", isSent ? "flex-row-reverse" : "flex-row")}>
          <span className="text-[10px] text-gray-400">{formatTime(message.createdAt)}</span>
          {isSent && isLastSent && (
            <span className={cn("text-[10px]", message.isRead ? "text-[#0F7B5A]" : "text-gray-400")}>
              {message.isRead ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Time group separator
export function MessageTimeSeparator({ dateStr }: { dateStr: string }) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

  let label: string;
  if (diffDays === 0) {
    label = "Today";
  } else if (diffDays === 1) {
    label = "Yesterday";
  } else if (diffDays < 7) {
    label = date.toLocaleDateString("en-NG", { weekday: "long" });
  } else {
    label = date.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
  }

  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400 shrink-0">{label}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}
