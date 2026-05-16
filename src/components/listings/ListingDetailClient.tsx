"use client";

import { useState } from "react";
import { MessageSquare, Copy, Check } from "lucide-react";
import { EnquiryModal } from "./EnquiryModal";

interface ListingDetailClientProps {
  listingId: string;
  listingTitle: string;
  isAuthenticated: boolean;
  showCopyOnly?: boolean;
}

export function ListingDetailClient({ listingId, listingTitle, isAuthenticated, showCopyOnly = false }: ListingDetailClientProps) {
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing
    }
  }

  if (showCopyOnly) {
    return (
      <button
        onClick={handleCopy}
        className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200 transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? "Copied!" : "Copy Link"}
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => {
          if (!isAuthenticated) {
            window.location.href = `/login?callbackUrl=/listings/${listingId}`;
            return;
          }
          setEnquiryOpen(true);
        }}
        className="w-full mt-2 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
      >
        <MessageSquare className="w-4 h-4" />
        Send Enquiry
      </button>

      <EnquiryModal
        listingId={listingId}
        listingTitle={listingTitle}
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
      />
    </>
  );
}
