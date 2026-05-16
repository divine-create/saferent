"use client";

import { useState, useEffect } from "react";
import { MapPin, Camera, CheckCircle, Clock, AlertTriangle } from "lucide-react";

type Props = {
  transactionId: string;
  moveInDate: string;
  onConfirmed: () => void;
};

export function MoveInConfirmation({ transactionId, moveInDate, onConfirmed }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [photoAdded, setPhotoAdded] = useState(false);
  const [countdown, setCountdown] = useState("");

  // 72h dispute window countdown
  useEffect(() => {
    if (!confirmed) return;
    const end = new Date(Date.now() + 72 * 60 * 60 * 1000);
    const timer = setInterval(() => {
      const diff = end.getTime() - Date.now();
      if (diff <= 0) {
        setCountdown("00:00:00");
        clearInterval(timer);
        return;
      }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [confirmed]);

  async function handleConfirm() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/transactions/${transactionId}/confirm-movein`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: 6.5244,
          longitude: 3.3792,
          photoUrl: photoAdded ? "https://example.com/mock-photo.jpg" : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to confirm move-in");
      setConfirmed(true);
      onConfirmed();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const moveInDateObj = new Date(moveInDate);
  const formattedDate = moveInDateObj.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });

  if (confirmed) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
          <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
          <h3 className="font-bold text-green-800 text-lg">Move-in Confirmed!</h3>
          <p className="text-green-700 text-sm mt-1">Funds are being released to the landlord.</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="font-semibold text-amber-800 text-sm">72-Hour Dispute Window</p>
          </div>
          <p className="text-amber-700 text-sm">
            If anything is not as described, raise a dispute before the window closes.
          </p>
          {countdown && (
            <div className="mt-3 text-center">
              <span className="font-mono text-2xl font-bold text-amber-800">{countdown}</span>
              <p className="text-xs text-amber-600 mt-1">remaining</p>
            </div>
          )}
          <a
            href={`/tenant/transactions/${transactionId}/dispute`}
            className="mt-3 flex items-center justify-center gap-2 py-2.5 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition-colors w-full"
          >
            <AlertTriangle className="w-4 h-4" />
            Raise a Dispute
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Scheduled move-in</span>
          <span className="font-semibold text-gray-900">{formattedDate}</span>
        </div>

        {/* GPS mock */}
        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2.5 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-green-600 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-green-800">Location verified</p>
            <p className="text-xs text-green-600">GPS: 6.5244° N, 3.3792° E</p>
          </div>
          <CheckCircle className="w-4 h-4 text-green-600 ml-auto shrink-0" />
        </div>

        {/* Photo upload UI */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Move-in photo (optional)</p>
          {photoAdded ? (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-700">Photo added</span>
            </div>
          ) : (
            <button
              onClick={() => setPhotoAdded(true)}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg px-4 py-4 text-center hover:border-[#0F7B5A] transition-colors group"
            >
              <Camera className="w-6 h-6 text-gray-400 group-hover:text-[#0F7B5A] mx-auto mb-1 transition-colors" />
              <p className="text-xs text-gray-500 group-hover:text-[#0F7B5A] transition-colors">Click to add photo</p>
            </button>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-start gap-2 text-xs text-blue-700">
          <Clock className="w-4 h-4 shrink-0 mt-0.5" />
          <p>After confirming, you have 72 hours to raise a dispute if anything is not as described.</p>
        </div>
      </div>

      <button
        onClick={handleConfirm}
        disabled={loading}
        className="w-full py-3.5 bg-[#0F7B5A] text-white font-semibold rounded-xl hover:bg-[#0a6049] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <CheckCircle className="w-5 h-5" />
        )}
        {loading ? "Confirming…" : "Confirm Move-in"}
      </button>
    </div>
  );
}
