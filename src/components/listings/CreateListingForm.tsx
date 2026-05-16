"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Building2, Home, Layers, BedDouble, Hotel,
  ChevronLeft, ChevronRight, Check, Plus, Minus,
  Zap, Droplets, Gauge, Wind, ChefHat, Users,
  Shield, Waves, Dumbbell, ParkingSquare, ArrowUp, PawPrint,
  Upload, X, ImageIcon
} from "lucide-react";
import { listingSchema, type ListingInput } from "@/lib/validations/listing";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Basic Details", description: "Property type & features" },
  { label: "Location", description: "Where is it?" },
  { label: "Pricing", description: "Rent & fees" },
  { label: "Amenities", description: "Features & extras" },
  { label: "Photos & Review", description: "Upload & submit" },
];

const PROPERTY_TYPES = [
  { value: "FLAT", label: "Flat", icon: <Building2 className="w-6 h-6" />, emoji: "🏢" },
  { value: "SELF_CONTAINED", label: "Self-contained", icon: <Home className="w-6 h-6" />, emoji: "🏠" },
  { value: "DUPLEX", label: "Duplex", icon: <Layers className="w-6 h-6" />, emoji: "🏗️" },
  { value: "BUNGALOW", label: "Bungalow", icon: <Home className="w-6 h-6" />, emoji: "🏡" },
  { value: "TERRACED_HOUSE", label: "Terraced House", icon: <Home className="w-6 h-6" />, emoji: "🏘️" },
  { value: "DETACHED_HOUSE", label: "Detached House", icon: <Home className="w-6 h-6" />, emoji: "🏠" },
  { value: "ROOM_AND_PARLOUR", label: "Room & Parlour", icon: <BedDouble className="w-6 h-6" />, emoji: "🛏️" },
  { value: "STUDIO", label: "Studio", icon: <Hotel className="w-6 h-6" />, emoji: "🏙️" },
] as const;

const AMENITY_ITEMS = [
  { value: "Generator", label: "Generator", icon: <Zap className="w-5 h-5" /> },
  { value: "Borehole", label: "Borehole/Water", icon: <Droplets className="w-5 h-5" /> },
  { value: "Prepaid Meter", label: "Prepaid Meter", icon: <Gauge className="w-5 h-5" /> },
  { value: "Central AC", label: "Central AC", icon: <Wind className="w-5 h-5" /> },
  { value: "Fitted Kitchen", label: "Fitted Kitchen", icon: <ChefHat className="w-5 h-5" /> },
  { value: "BQ (Boys Quarter)", label: "BQ (Boys Quarter)", icon: <Users className="w-5 h-5" /> },
  { value: "Security", label: "Security", icon: <Shield className="w-5 h-5" /> },
  { value: "Swimming Pool", label: "Swimming Pool", icon: <Waves className="w-5 h-5" /> },
  { value: "Gym", label: "Gym", icon: <Dumbbell className="w-5 h-5" /> },
  { value: "Parking", label: "Parking", icon: <ParkingSquare className="w-5 h-5" /> },
  { value: "Elevator", label: "Elevator", icon: <ArrowUp className="w-5 h-5" /> },
  { value: "Pet-friendly", label: "Pet-friendly", icon: <PawPrint className="w-5 h-5" /> },
];

const STATES_LGAS: Record<string, string[]> = {
  Lagos: [
    "Ikeja", "Lekki", "Victoria Island", "Ikoyi", "Surulere", "Yaba",
    "Ajah", "Eti-Osa", "Alimosho", "Lagos Island", "Lagos Mainland",
    "Kosofe", "Mushin", "Amuwo-Odofin", "Ojo",
  ],
  "Abuja FCT": [
    "Municipal Area Council", "Garki", "Wuse", "Maitama", "Asokoro",
    "Gwarinpa", "Kubwa", "Karu", "Bwari", "Gwagwalada",
  ],
  Ogun: ["Abeokuta North", "Abeokuta South", "Ijebu Ode", "Sagamu", "Ota", "Ifo"],
  Rivers: ["Port Harcourt", "Obio-Akpor", "Okrika", "Eleme", "Bonny"],
  Kano: ["Kano Municipal", "Fagge", "Dala", "Gwale", "Nasarawa"],
};

type PhotoPreview = { id: string; file: File; url: string; caption: string };

interface CreateListingFormProps {
  role: string;
}

export function CreateListingForm({ role }: CreateListingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
    trigger,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<ListingInput>({
    // @ts-expect-error: zod v4 + hookform resolver version mismatch — works at runtime
    resolver: zodResolver(listingSchema),
    defaultValues: {
      propertyType: "FLAT",
      bedrooms: 2,
      bathrooms: 2,
      toilets: 2,
      furnishingStatus: "UNFURNISHED",
      letType: "LONG_LET",
      propertyCondition: "GOOD",
      paymentFrequencies: ["ANNUAL"],
      amenities: [],
      availableFrom: new Date().toISOString().split("T")[0],
    },
  });

  const watchedState = watch("state");
  const watchedPropertyType = watch("propertyType");
  const watchedFurnishing = watch("furnishingStatus");
  const watchedLetType = watch("letType");
  const watchedCondition = watch("propertyCondition");
  const watchedAmenities = watch("amenities");
  const watchedPaymentFreqs = watch("paymentFrequencies");

  // Step validation fields
  const STEP_FIELDS: (keyof ListingInput)[][] = [
    ["propertyType", "bedrooms", "bathrooms", "toilets", "furnishingStatus", "letType", "propertyCondition", "availableFrom"],
    ["address", "area", "lga", "state"],
    ["annualRent", "paymentFrequencies"],
    ["amenities"],
    ["title"],
  ];

  async function goNext() {
    const valid = await trigger(STEP_FIELDS[step] as (keyof ListingInput)[]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function toggleAmenity(value: string) {
    const current = watchedAmenities ?? [];
    const next = current.includes(value) ? current.filter((a) => a !== value) : [...current, value];
    setValue("amenities", next);
  }

  function togglePaymentFreq(value: "ANNUAL" | "BIANNUAL" | "QUARTERLY" | "MONTHLY") {
    const current = watchedPaymentFreqs ?? [];
    const next = current.includes(value) ? current.filter((f) => f !== value) : [...current, value];
    setValue("paymentFrequencies", next as ("ANNUAL" | "BIANNUAL" | "QUARTERLY" | "MONTHLY")[]);
  }

  function handlePhotoFiles(files: FileList | File[]) {
    const newPhotos: PhotoPreview[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 10 - photos.length)
      .map((file) => ({
        id: Math.random().toString(36).slice(2),
        file,
        url: URL.createObjectURL(file),
        caption: "",
      }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  }

  function removePhoto(id: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = useCallback(
    async (data: ListingInput) => {
      setSubmitting(true);
      setSubmitError("");
      try {
        const res = await fetch("/api/listings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (res.ok && json.listing?.id) {
          router.push(`/listings/${json.listing.id}`);
        } else {
          setSubmitError(json.error ?? "Failed to create listing. Please try again.");
          setSubmitting(false);
        }
      } catch {
        setSubmitError("Network error. Please check your connection and try again.");
        setSubmitting(false);
      }
    },
    [router]
  );

  const values = getValues();

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                    i < step
                      ? "bg-[#0F7B5A] border-[#0F7B5A] text-white"
                      : i === step
                      ? "bg-white border-[#0F7B5A] text-[#0F7B5A]"
                      : "bg-white border-gray-200 text-gray-400"
                  )}
                >
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-xs mt-1 font-medium hidden sm:block",
                    i === step ? "text-[#0F7B5A]" : i < step ? "text-gray-600" : "text-gray-400"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("flex-1 h-0.5 mx-2", i < step ? "bg-[#0F7B5A]" : "bg-gray-200")} />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2 text-center">
          Step {step + 1} of {STEPS.length} — {STEPS[step].description}
        </p>
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <form onSubmit={handleSubmit(onSubmit as any)}>
        {/* ====== STEP 1: Basic Details ====== */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Property Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PROPERTY_TYPES.map((pt) => (
                  <button
                    key={pt.value}
                    type="button"
                    onClick={() => setValue("propertyType", pt.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center",
                      watchedPropertyType === pt.value
                        ? "border-[#0F7B5A] bg-[#0F7B5A]/5 text-[#0F7B5A]"
                        : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <span className="text-2xl">{pt.emoji}</span>
                    <span className="text-xs font-semibold leading-tight">{pt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bedrooms / Bathrooms / Toilets steppers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(["bedrooms", "bathrooms", "toilets"] as const).map((field) => {
                const val = watch(field) as number;
                const min = field === "bedrooms" ? 0 : 1;
                const max = 5;
                return (
                  <div key={field}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 capitalize">{field}</label>
                    <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-2">
                      <button
                        type="button"
                        onClick={() => setValue(field, Math.max(min, val - 1))}
                        className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="flex-1 text-center font-bold text-gray-900 text-lg">
                        {val === 0 && field === "bedrooms" ? "0 (Self-con.)" : `${val}${val >= max ? "+" : ""}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setValue(field, Math.min(max, val + 1))}
                        className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]?.message}</p>}
                  </div>
                );
              })}
            </div>

            {/* Floor level */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Floor Level <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="number"
                {...register("floorLevel", { valueAsNumber: true })}
                placeholder="e.g. 3 (ground floor = 0)"
                className="w-full sm:w-48 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A]"
              />
            </div>

            {/* Furnishing */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Furnishing Status</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "UNFURNISHED", label: "Unfurnished" },
                  { value: "SEMI_FURNISHED", label: "Semi-furnished" },
                  { value: "FULLY_FURNISHED", label: "Fully Furnished" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue("furnishingStatus", opt.value as ListingInput["furnishingStatus"])}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium border-2 transition-all",
                      watchedFurnishing === opt.value
                        ? "border-[#0F7B5A] bg-[#0F7B5A] text-white"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Let type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Let Type</label>
              <div className="flex gap-2">
                {[
                  { value: "LONG_LET", label: "Long Let" },
                  { value: "SHORT_LET", label: "Short Let" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue("letType", opt.value as ListingInput["letType"])}
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all",
                      watchedLetType === opt.value
                        ? "border-[#0F7B5A] bg-[#0F7B5A] text-white"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Property condition */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Property Condition</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "NEW", label: "New", desc: "Brand new build" },
                  { value: "GOOD", label: "Good", desc: "Well maintained" },
                  { value: "NEEDS_MINOR_WORK", label: "Needs Minor Work", desc: "Slight renovation" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue("propertyCondition", opt.value as ListingInput["propertyCondition"])}
                    className={cn(
                      "p-3 rounded-xl border-2 text-left transition-all",
                      watchedCondition === opt.value
                        ? "border-[#0F7B5A] bg-[#0F7B5A]/5"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <p className={cn("text-sm font-semibold", watchedCondition === opt.value ? "text-[#0F7B5A]" : "text-gray-700")}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Available from */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Available From</label>
              <input
                type="date"
                {...register("availableFrom")}
                className="w-full sm:w-64 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A]"
              />
              {errors.availableFrom && <p className="text-xs text-red-500 mt-1">{errors.availableFrom.message}</p>}
            </div>
          </div>
        )}

        {/* ====== STEP 2: Location ====== */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
                <select
                  {...register("state")}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A] bg-white"
                >
                  <option value="">Select state</option>
                  {Object.keys(STATES_LGAS).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">LGA</label>
                <select
                  {...register("lga")}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A] bg-white disabled:opacity-50"
                  disabled={!watchedState}
                >
                  <option value="">Select LGA</option>
                  {(STATES_LGAS[watchedState] ?? []).map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
                {errors.lga && <p className="text-xs text-red-500 mt-1">{errors.lga.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Area / Neighbourhood</label>
              <input
                type="text"
                {...register("area")}
                placeholder="e.g. Lekki Phase 1, Maitama, Ikeja GRA"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A]"
              />
              {errors.area && <p className="text-xs text-red-500 mt-1">{errors.area.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Address</label>
              <input
                type="text"
                {...register("address")}
                placeholder="e.g. 12 Admiralty Way, Lekki Phase 1"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A]"
              />
              {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nearest Landmark <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                {...register("landmark")}
                placeholder="e.g. Near Lekki Phase 1 Roundabout"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Neighbourhood Description <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                {...register("neighbourhoodDescription")}
                rows={3}
                placeholder="Describe the neighbourhood, nearby amenities, security, etc."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A]"
              />
            </div>
          </div>
        )}

        {/* ====== STEP 3: Pricing ====== */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Annual Rent (₦)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₦</span>
                <input
                  type="number"
                  {...register("annualRent", { valueAsNumber: true })}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A]"
                />
              </div>
              {errors.annualRent && <p className="text-xs text-red-500 mt-1">{errors.annualRent.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Frequencies Accepted</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: "ANNUAL" as const, label: "Annual", desc: "Once a year" },
                  { value: "BIANNUAL" as const, label: "Biannual", desc: "Every 6 months" },
                  { value: "QUARTERLY" as const, label: "Quarterly", desc: "Every 3 months" },
                  { value: "MONTHLY" as const, label: "Monthly", desc: "Every month" },
                ].map((opt) => {
                  const selected = (watchedPaymentFreqs ?? []).includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => togglePaymentFreq(opt.value)}
                      className={cn(
                        "p-3 rounded-xl border-2 text-left transition-all",
                        selected
                          ? "border-[#0F7B5A] bg-[#0F7B5A]/5"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <p className={cn("text-sm font-semibold", selected ? "text-[#0F7B5A]" : "text-gray-700")}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
              {errors.paymentFrequencies && (
                <p className="text-xs text-red-500 mt-1">{errors.paymentFrequencies.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Caution Deposit (₦) <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₦</span>
                  <input
                    type="number"
                    {...register("cautionDeposit", { valueAsNumber: true })}
                    placeholder="Usually 1× annual rent"
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Service Charge (₦) <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₦</span>
                  <input
                    type="number"
                    {...register("serviceCharge", { valueAsNumber: true })}
                    placeholder="e.g. 500000"
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A]"
                  />
                </div>
              </div>
            </div>

            {role === "AGENT" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Agency Fee (₦) <span className="text-gray-400 font-normal">(agents only)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₦</span>
                  <input
                    type="number"
                    {...register("agencyFee", { valueAsNumber: true })}
                    placeholder="e.g. 10% of annual rent"
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A]"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ====== STEP 4: Amenities & Details ====== */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Amenities <span className="text-gray-400 font-normal">(select all that apply)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {AMENITY_ITEMS.map((item) => {
                  const selected = (watchedAmenities ?? []).includes(item.value);
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => toggleAmenity(item.value)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all",
                        selected
                          ? "border-[#0F7B5A] bg-[#0F7B5A]/5 text-[#0F7B5A]"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      )}
                    >
                      {item.icon}
                      <span className="text-xs font-medium leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Year Built <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="number"
                {...register("yearBuilt", { valueAsNumber: true })}
                placeholder="e.g. 2018"
                min={1900}
                max={2030}
                className="w-full sm:w-40 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A]"
              />
            </div>
          </div>
        )}

        {/* ====== STEP 5: Photos & Review ====== */}
        {step === 4 && (
          <div className="space-y-8">
            {/* Title & description (collected here) */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Listing Title</label>
                <input
                  type="text"
                  {...register("title")}
                  placeholder="e.g. Spacious 3-Bedroom Flat in Lekki Phase 1"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A]"
                />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Description <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  {...register("description")}
                  rows={4}
                  placeholder="Describe the property in detail — finishes, view, nearby attractions, etc."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0F7B5A]/30 focus:border-[#0F7B5A]"
                />
              </div>
            </div>

            {/* Photo upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Photos <span className="text-gray-400 font-normal">(up to 10 photos)</span>
              </label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handlePhotoFiles(e.dataTransfer.files);
                }}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer",
                  dragOver
                    ? "border-[#0F7B5A] bg-[#0F7B5A]/5"
                    : "border-gray-200 hover:border-gray-300"
                )}
                onClick={() => document.getElementById("photo-input")?.click()}
              >
                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">Drag photos here or click to browse</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG or WebP. Max 10 photos.</p>
                <input
                  id="photo-input"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files && handlePhotoFiles(e.target.files)}
                />
              </div>

              {/* Photo previews */}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3">
                  {photos.map((photo, idx) => (
                    <div key={photo.id} className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-20 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-[#0F7B5A] text-white text-xs px-1.5 py-0.5 rounded">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                  {photos.length < 10 && (
                    <button
                      type="button"
                      onClick={() => document.getElementById("photo-input")?.click()}
                      className="h-20 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center hover:border-gray-300 transition-colors"
                    >
                      <ImageIcon className="w-5 h-5 text-gray-300" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Review summary */}
            <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-gray-900 text-base">Summary</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <ReviewRow label="Property Type" value={PROPERTY_TYPES.find((p) => p.value === values.propertyType)?.label ?? ""} />
                <ReviewRow label="Bedrooms" value={String(values.bedrooms)} />
                <ReviewRow label="Bathrooms" value={String(values.bathrooms)} />
                <ReviewRow label="Furnishing" value={(values.furnishingStatus ?? "").replace("_", " ")} />
                <ReviewRow label="Let Type" value={(values.letType ?? "").replace("_", " ")} />
                <ReviewRow label="Area" value={values.area ?? "—"} />
                <ReviewRow label="LGA" value={values.lga ?? "—"} />
                <ReviewRow label="State" value={values.state ?? "—"} />
                <ReviewRow
                  label="Annual Rent"
                  value={values.annualRent ? `₦${Number(values.annualRent).toLocaleString("en-NG")}` : "—"}
                />
                <ReviewRow label="Payment" value={(values.paymentFrequencies ?? []).join(", ") || "—"} />
                <ReviewRow label="Amenities" value={`${(values.amenities ?? []).length} selected`} />
                <ReviewRow label="Photos" value={`${photos.length} uploaded`} />
              </div>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
                {submitError}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#0F7B5A] text-white rounded-xl text-sm font-semibold hover:bg-[#0a6049] transition-colors"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-2.5 bg-[#0F7B5A] text-white rounded-xl text-sm font-semibold hover:bg-[#0a6049] disabled:opacity-60 transition-colors"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Publish Listing
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right">{value || "—"}</span>
    </div>
  );
}
