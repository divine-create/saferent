"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, Paperclip, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { LANDLORD_TEMPLATES } from "@/lib/message-templates";

interface MessageInputProps {
  conversationId: string;
  currentUserId: string;
  userRole: string;
  onMessageSent: (message: {
    id: string;
    conversationId: string;
    senderId: string;
    type: "TEXT";
    content: string;
    isRead: boolean;
    readAt: null;
    systemEventType: null;
    createdAt: string;
    sender: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      profilePhoto?: string | null;
      role: string;
    };
  }) => void;
}

export function MessageInput({ conversationId, currentUserId, userRole, onMessageSent }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isLandlordOrAgent = userRole === "LANDLORD" || userRole === "AGENT";

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [content]);

  async function handleSend() {
    const trimmed = content.trim();
    if (!trimmed || sending) return;
    setError(null);
    setSending(true);

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "Failed to send message");
        return;
      }

      const data = await res.json() as {
        message: {
          id: string;
          conversationId: string;
          senderId: string;
          type: "TEXT";
          content: string;
          isRead: boolean;
          readAt: null;
          systemEventType: null;
          createdAt: string;
          sender: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            profilePhoto?: string | null;
            role: string;
          };
        };
      };
      onMessageSent(data.message);
      setContent("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function applyTemplate(text: string) {
    setContent(text);
    textareaRef.current?.focus();
  }

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Quick reply templates for landlords/agents */}
      {isLandlordOrAgent && (
        <div className="px-4 pt-3 pb-0 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {LANDLORD_TEMPLATES.map((t) => (
            <button
              key={t.label}
              onClick={() => applyTemplate(t.text)}
              className="shrink-0 text-xs bg-gray-100 hover:bg-green-50 hover:text-[#0F7B5A] text-gray-600 rounded-full px-3 py-1.5 transition-colors whitespace-nowrap"
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="px-4 py-3 flex items-end gap-2">
        {/* Attachment button */}
        <div className="relative group">
          <button
            type="button"
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors shrink-0"
            title="Images and PDFs only — no links"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          {/* Tooltip */}
          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
            <div className="bg-gray-800 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg">
              Images and PDFs only — no links
            </div>
          </div>
        </div>

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            rows={1}
            className={cn(
              "w-full resize-none rounded-2xl border px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A] transition-all",
              error ? "border-red-400" : "border-gray-200"
            )}
            style={{ maxHeight: "120px" }}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!content.trim() || sending}
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0",
            content.trim() && !sending
              ? "bg-[#0F7B5A] text-white hover:bg-[#0a6049] shadow-md"
              : "bg-gray-100 text-gray-300 cursor-not-allowed"
          )}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 pb-2">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Security disclaimer */}
      <div className="px-4 pb-3 flex items-center gap-1.5">
        <Lock className="w-3 h-3 text-gray-300 shrink-0" />
        <p className="text-[10px] text-gray-400">
          No external links allowed — SafeRent protects against phishing
        </p>
      </div>
    </div>
  );
}
