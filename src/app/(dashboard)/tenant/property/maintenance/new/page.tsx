"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Droplet,
  Zap,
  Building,
  Package,
  Lock,
  Bug,
  Sparkles,
  HelpCircle,
  ArrowLeft,
  Upload,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "PLUMBING", label: "Plumbing", icon: Droplet, color: "text-blue-600 bg-blue-50" },
  { value: "ELECTRICAL", label: "Electrical", icon: Zap, color: "text-yellow-600 bg-yellow-50" },
  { value: "STRUCTURAL", label: "Structural", icon: Building, color: "text-gray-600 bg-gray-50" },
  { value: "APPLIANCE", label: "Appliance", icon: Package, color: "text-purple-600 bg-purple-50" },
  { value: "SECURITY", label: "Security", icon: Lock, color: "text-red-600 bg-red-50" },
  { value: "PEST_CONTROL", label: "Pest Control", icon: Bug, color: "text-orange-600 bg-orange-50" },
  { value: "CLEANING", label: "Cleaning", icon: Sparkles, color: "text-green-600 bg-green-50" },
  { value: "OTHER", label: "Other", icon: HelpCircle, color: "text-indigo-600 bg-indigo-50" },
];

const URGENCIES = [
  { value: "low", label: "Low", desc: "No rush, convenient fix", color: "border-gray-200 text-gray-700" },
  { value: "normal", label: "Normal", desc: "Should be fixed this week", color: "border-blue-200 text-blue-700 bg-blue-50" },
  { value: "urgent", label: "Urgent", desc: "Affecting daily living", color: "border-red-200 text-red-700 bg-red-50" },
];

// Mock tenancy for demo
const MOCK_TENANCY_ID = "mock_tx_1";
const MOCK_LANDLORD_ID = "u1";

export default function NewMaintenancePage() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) { setError("Please select a category"); return; }
    if (!title.trim()) { setError("Please enter a title"); return; }
    if (!description.trim()) { setError("Please describe the issue"); return; }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenancyId: MOCK_TENANCY_ID,
          landlordId: MOCK_LANDLORD_ID,
          category,
          title: title.trim(),
          description: description.trim(),
          urgency,
          photoUrls: photos,
        }),
      });

      if (!res.ok) {
        const d = await res.json() as { error?: string };
        setError(d.error ?? "Failed to submit request");
        return;
      }

      router.push("/tenant/property");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/tenant/property"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Report Maintenance Issue</h1>
          <p className="text-sm text-gray-500">12 Admiralty Way, Lekki Phase 1</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Category *</h2>
          <div className="grid grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                    category === cat.value
                      ? "border-[#0F7B5A] bg-green-50"
                      : "border-gray-100 hover:border-gray-200"
                  )}
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", cat.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Urgency */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Urgency *</h2>
          <div className="grid grid-cols-3 gap-3">
            {URGENCIES.map((u) => (
              <button
                key={u.value}
                type="button"
                onClick={() => setUrgency(u.value)}
                className={cn(
                  "p-3 rounded-xl border-2 text-left transition-all",
                  urgency === u.value
                    ? `border-current ${u.color}`
                    : "border-gray-100 hover:border-gray-200"
                )}
              >
                <p className="font-semibold text-sm">{u.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{u.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Title and Description */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Issue Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Kitchen sink drainage blocked"
              maxLength={100}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A]"
            />
            <p className="text-xs text-gray-400 mt-1">{title.length}/100</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the issue in detail. When did it start? What's the impact on your daily life?"
              maxLength={1000}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A]"
            />
            <p className="text-xs text-gray-400 mt-1">{description.length}/1000</p>
          </div>
        </div>

        {/* Photo Upload (mock) */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-1">Photos (optional)</h2>
          <p className="text-xs text-gray-500 mb-4">Upload photos to help your landlord understand the issue</p>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#0F7B5A] transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Click to upload photos</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB each</p>
          </div>
          {photos.length > 0 && (
            <p className="text-xs text-green-600 mt-2">{photos.length} photo(s) selected</p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Link
            href="/tenant/property"
            className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#0F7B5A] text-white text-sm font-medium px-4 py-3 rounded-lg hover:bg-[#0a6049] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
