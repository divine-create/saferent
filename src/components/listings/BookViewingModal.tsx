"use client";

import { useState } from "react";
import { X, Calendar, Clock, CheckCircle, Plus, Trash2 } from "lucide-react";

type TimeSlot = { date: string; time: string };

type Props = {
  listingId: string;
  listingTitle: string;
  isOpen: boolean;
  onClose: () => void;
};

const TIME_OPTIONS = [
  "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00",
];

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

export function BookViewingModal({ listingId, listingTitle, isOpen, onClose }: Props) {
  const [slots, setSlots] = useState<TimeSlot[]>([{ date: tomorrow(), time: "10:00" }]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  function addSlot() {
    if (slots.length >= 3) return;
    setSlots((prev) => [...prev, { date: tomorrow(), time: "10:00" }]);
  }

  function removeSlot(i: number) {
    if (slots.length <= 1) return;
    setSlots((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateSlot(i: number, field: keyof TimeSlot, value: string) {
    setSlots((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  }

  async function handleSubmit() {
    const valid = slots.every((s) => s.date && s.time);
    if (!valid) {
      setError("Please fill in all time slots.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/viewings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, proposedSlots: slots, notes: notes || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to book viewing");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const minDate = tomorrow();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">Book a Viewing</h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[250px]">{listingTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {success ? (
            <div className="py-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Viewing Requested!</h3>
              <p className="text-gray-500 text-sm">
                The landlord will confirm your preferred time slot shortly. Check your dashboard for updates.
              </p>
              <button
                onClick={onClose}
                className="mt-5 w-full py-3 bg-[#0F7B5A] text-white font-semibold rounded-xl hover:bg-[#0a6049] transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Time slots */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-900">
                    Preferred time slots
                    <span className="text-gray-400 font-normal ml-1">(up to 3)</span>
                  </label>
                </div>

                <div className="space-y-3">
                  {slots.map((slot, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <Calendar className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                            <input
                              type="date"
                              min={minDate}
                              value={slot.date}
                              onChange={(e) => updateSlot(i, "date", e.target.value)}
                              className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A]"
                            />
                          </div>
                          <div className="w-28 relative">
                            <Clock className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                            <select
                              value={slot.time}
                              onChange={(e) => updateSlot(i, "time", e.target.value)}
                              className="w-full border border-gray-300 rounded-lg pl-8 pr-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A] appearance-none"
                            >
                              {TIME_OPTIONS.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      {slots.length > 1 && (
                        <button
                          onClick={() => removeSlot(i)}
                          className="w-8 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shrink-0 mt-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {slots.length < 3 && (
                  <button
                    onClick={addSlot}
                    className="mt-3 flex items-center gap-1.5 text-sm text-[#0F7B5A] font-medium hover:underline"
                  >
                    <Plus className="w-4 h-4" />
                    Add another time slot
                  </button>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Message to landlord <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any questions or special requirements for the viewing?"
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A] resize-none"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3.5 bg-[#0F7B5A] text-white font-semibold rounded-xl hover:bg-[#0a6049] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <Calendar className="w-5 h-5" />
                )}
                {loading ? "Submitting…" : "Request Viewing"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
