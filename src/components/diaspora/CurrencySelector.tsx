"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { ChevronDown } from "lucide-react";
import { SUPPORTED_CURRENCIES, CURRENCY_FLAGS, type Currency } from "@/lib/currency";

export function CurrencySelector() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Currency>("NGN");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("preferredCurrency") as Currency | null;
    if (stored && SUPPORTED_CURRENCIES.includes(stored)) {
      setSelected(stored);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (currency: Currency) => {
    setSelected(currency);
    localStorage.setItem("preferredCurrency", currency);
    setOpen(false);
    if (session?.user) {
      try {
        await fetch("/api/user/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ preferredCurrency: currency }),
        });
      } catch {
        // ignore
      }
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700 border border-gray-200 transition-colors"
      >
        <span>{CURRENCY_FLAGS[selected]}</span>
        <span>{selected}</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <p className="text-xs text-gray-500 px-1">Payments processed in ₦ at live rate</p>
          </div>
          <div className="py-1">
            {SUPPORTED_CURRENCIES.map((currency) => (
              <button
                key={currency}
                onClick={() => handleSelect(currency)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  selected === currency ? "bg-green-50 text-[#0F7B5A] font-medium" : "text-gray-700"
                }`}
              >
                <span className="text-base">{CURRENCY_FLAGS[currency]}</span>
                <span>{currency}</span>
                {selected === currency && (
                  <span className="ml-auto text-[#0F7B5A]">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
