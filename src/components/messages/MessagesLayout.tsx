"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ChevronLeft, MessageCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { MockConversation, MockMessage } from "@/lib/mock-conversations";
import { ConversationItem } from "./ConversationItem";
import { MessageBubble, MessageTimeSeparator } from "./MessageBubble";
import { MessageInput } from "./MessageInput";

interface MessagesLayoutProps {
  initialConversations: MockConversation[];
  currentUserId: string;
  userRole: string;
}

function getInitials(firstName: string | null, lastName: string | null): string {
  const f = (firstName ?? "").charAt(0).toUpperCase();
  const l = (lastName ?? "").charAt(0).toUpperCase();
  return f + l || "?";
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function isMoreThan30Min(a: string, b: string): boolean {
  return Math.abs(new Date(b).getTime() - new Date(a).getTime()) > 30 * 60 * 1000;
}

export function MessagesLayout({ initialConversations, currentUserId, userRole }: MessagesLayoutProps) {
  const searchParams = useSearchParams();
  const initConvId = searchParams.get("conversation");

  const [conversations, setConversations] = useState<MockConversation[]>(initialConversations);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeConvId, setActiveConvId] = useState<string | null>(initConvId ?? null);
  const [messages, setMessages] = useState<MockMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showMobileThread, setShowMobileThread] = useState(!!initConvId);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevMsgCount = useRef(0);

  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;

  const otherParty = activeConv
    ? activeConv.tenantId === currentUserId
      ? activeConv.owner
      : activeConv.tenant
    : null;

  // Load messages for active conversation
  const loadMessages = useCallback(
    async (convId: string, silent = false) => {
      if (!silent) setLoadingMessages(true);
      try {
        const res = await fetch(`/api/conversations/${convId}`);
        if (res.ok) {
          const data = await res.json() as { conversation: MockConversation & { messages: MockMessage[] } };
          const newMsgs = data.conversation.messages;

          // Toast notification for new messages (polled)
          if (silent && newMsgs.length > prevMsgCount.current) {
            // Simple toast — update title bar
            document.title = "New message — SafeRent";
            setTimeout(() => { document.title = "Messages — SafeRent"; }, 3000);
          }
          prevMsgCount.current = newMsgs.length;

          setMessages(newMsgs);

          // Update unread in conv list
          setConversations((prev) =>
            prev.map((c) =>
              c.id === convId
                ? { ...c, tenantUnread: 0, ownerUnread: 0 }
                : c
            )
          );
        }
      } catch {
        // Fallback to mock data
        const conv = initialConversations.find((c) => c.id === convId);
        if (conv) {
          setMessages(conv.messages);
          prevMsgCount.current = conv.messages.length;
        }
      } finally {
        if (!silent) setLoadingMessages(false);
      }
    },
    [initialConversations]
  );

  // Select a conversation
  function selectConversation(convId: string) {
    setActiveConvId(convId);
    setShowMobileThread(true);
    loadMessages(convId);

    // Update URL without reload
    const url = new URL(window.location.href);
    url.searchParams.set("conversation", convId);
    window.history.pushState({}, "", url.toString());
  }

  // On mount — load initial conversation if provided
  useEffect(() => {
    if (initConvId) {
      loadMessages(initConvId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Polling every 5 seconds
  useEffect(() => {
    if (!activeConvId) return;
    pollingRef.current = setInterval(() => {
      loadMessages(activeConvId, true);
    }, 5000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeConvId, loadMessages]);

  // Handle new message from input
  function handleMessageSent(msg: MockMessage) {
    setMessages((prev) => [...prev, msg]);

    // Update conversation list preview
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              lastMessageAt: msg.createdAt,
              lastMessageText: msg.content.slice(0, 200),
            }
          : c
      )
    );
  }

  // Filtered conversations
  const filtered = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const isTenant = c.tenantId === currentUserId;
    const other = isTenant ? c.owner : c.tenant;
    const name = [other.firstName, other.lastName].filter(Boolean).join(" ").toLowerCase();
    return name.includes(q) || c.listing.title.toLowerCase().includes(q) || c.listing.area.toLowerCase().includes(q);
  });

  // Compute message groups for time separators
  function getGroupedMessages(): { msg: MockMessage; showSeparator: boolean }[] {
    return messages.map((msg, i) => {
      const prev = messages[i - 1];
      const showSeparator =
        i === 0 ||
        !isSameDay(prev.createdAt, msg.createdAt) ||
        (msg.type !== "SYSTEM" && prev?.type !== "SYSTEM" && isMoreThan30Min(prev.createdAt, msg.createdAt));
      return { msg, showSeparator };
    });
  }

  // Find last sent message index (for read receipt)
  const lastSentIdx = [...messages].reverse().findIndex((m) => m.senderId === currentUserId && m.type !== "SYSTEM");
  const lastSentId = lastSentIdx >= 0 ? messages[messages.length - 1 - lastSentIdx]?.id : null;

  return (
    <div className="flex h-[calc(100vh-4rem)] lg:h-[calc(100vh-2rem)] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* LEFT PANEL — conversation list */}
      <div
        className={cn(
          "flex flex-col border-r border-gray-200 bg-white",
          "w-full lg:w-80 xl:w-96",
          showMobileThread ? "hidden lg:flex" : "flex"
        )}
      >
        {/* Search */}
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/20 focus:border-[#0F7B5A]"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <MessageCircle className="w-12 h-12 text-gray-200 mb-3" />
              <p className="font-semibold text-gray-500 text-sm">No conversations yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Enquire about a listing to start messaging
              </p>
              <Link
                href="/listings"
                className="mt-4 text-sm text-[#0F7B5A] font-medium hover:underline"
              >
                Browse listings
              </Link>
            </div>
          ) : (
            filtered.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                currentUserId={currentUserId}
                isActive={conv.id === activeConvId}
                onClick={() => selectConversation(conv.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANEL — message thread */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0",
          !showMobileThread ? "hidden lg:flex" : "flex"
        )}
      >
        {activeConv && otherParty ? (
          <>
            {/* Thread header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
              {/* Mobile back button */}
              <button
                className="lg:hidden p-1 rounded-lg hover:bg-gray-100 mr-1"
                onClick={() => setShowMobileThread(false)}
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>

              {/* Listing thumbnail */}
              {activeConv.listing.photos[0] && (
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeConv.listing.photos[0].url}
                    alt={activeConv.listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {[otherParty.firstName, otherParty.lastName].filter(Boolean).join(" ")}
                  </p>
                  {otherParty.landlordVerification?.badgeTier &&
                    otherParty.landlordVerification.badgeTier !== "NONE" && (
                      <span className="text-[10px] bg-[#D4A017]/10 text-[#D4A017] font-semibold px-1.5 py-0.5 rounded-full shrink-0">
                        {otherParty.landlordVerification.badgeTier === "CERTIFIED"
                          ? "Certified"
                          : otherParty.landlordVerification.badgeTier === "PROPERTY_VERIFIED"
                          ? "Property Verified"
                          : "ID Verified"}
                      </span>
                    )}
                </div>
                <p className="text-xs text-gray-500 truncate">{activeConv.listing.area} · {activeConv.listing.address}</p>
              </div>

              <Link
                href={`/listings/${activeConv.listingId}`}
                className="shrink-0 flex items-center gap-1 text-xs text-[#0F7B5A] font-medium hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View Listing</span>
              </Link>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-gray-50/30">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-sm text-gray-400">Loading messages…</div>
                </div>
              ) : (
                <>
                  {getGroupedMessages().map(({ msg, showSeparator }) => (
                    <div key={msg.id}>
                      {showSeparator && msg.type !== "SYSTEM" && (
                        <MessageTimeSeparator dateStr={msg.createdAt} />
                      )}
                      <MessageBubble
                        message={msg}
                        currentUserId={currentUserId}
                        isLastSent={msg.id === lastSentId}
                      />
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <MessageInput
              conversationId={activeConv.id}
              currentUserId={currentUserId}
              userRole={userRole}
              onMessageSent={handleMessageSent}
            />
          </>
        ) : (
          /* Empty state — no conversation selected */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50/30">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
              <MessageCircle className="w-10 h-10 text-gray-300" />
            </div>
            <p className="font-semibold text-gray-600 text-lg">Select a conversation</p>
            <p className="text-sm text-gray-400 mt-2 max-w-xs">
              Choose a conversation from the list to start messaging, or enquire about a listing to begin a new thread.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
