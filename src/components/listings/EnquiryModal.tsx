"use client";

import { useState } from "react";
import { X, Send, CheckCircle } from "lucide-react";

interface EnquiryModalProps {
  listingId: string;
  listingTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function EnquiryModal({ listingId, listingTitle, isOpen, onClose }: EnquiryModalProps) {
  const [message, setMessage] = useState(
    `Hi, I am interested in this property. Could you please provide more details?`
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length < 10) {
      setError("Please write a message of at least 10 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/listings/${listingId}/enquire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error ?? "Failed to send enquiry. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md mx-4 sm:mx-auto p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Send Enquiry</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-7 h-7 text-[#0F7B5A]" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Enquiry Sent!</h3>
            <p className="text-sm text-gray-500">
              The landlord/agent has received your message and will respond shortly.
            </p>
            <button
              onClick={onClose}
              className="mt-5 w-full py-2.5 bg-[#0F7B5A] text-white font-medium rounded-xl hover:bg-[#0a6049] transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-1">
              <p className="text-xs text-gray-500 mb-3 line-clamp-1">Re: {listingTitle}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Your message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A]"
                placeholder="Write your message to the landlord..."
              />
              <div className="flex justify-between mt-1">
                {error && <p className="text-xs text-red-500">{error}</p>}
                <p className="text-xs text-gray-400 ml-auto">{message.length}/2000</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0F7B5A] text-white font-semibold rounded-xl hover:bg-[#0a6049] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Enquiry
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
