"use client";

import { useState } from "react";
import { MOCK_RATES, CURRENCY_FLAGS, formatCurrency, convertFromNGN } from "@/lib/currency";

const DISPLAY_CURRENCIES = [
  { code: "USD" as const, name: "US Dollar" },
  { code: "GBP" as const, name: "British Pound" },
  { code: "EUR" as const, name: "Euro" },
];

export function DiasporaCurrencyConverter() {
  const [ngnAmount, setNgnAmount] = useState("1200000");

  const amount = parseFloat(ngnAmount.replace(/,/g, "")) || 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Annual rent in Naira (₦)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₦</span>
          <input
            type="text"
            value={ngnAmount}
            onChange={(e) => setNgnAmount(e.target.value.replace(/[^0-9]/g, ""))}
            className="w-full pl-8 pr-4 py-3 text-lg font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F7B5A] focus:border-transparent"
            placeholder="1200000"
          />
        </div>
        {amount > 0 && (
          <p className="text-xs text-gray-400 mt-1.5">
            ₦{amount.toLocaleString()} per annum
          </p>
        )}
      </div>

      <div className="space-y-3">
        {DISPLAY_CURRENCIES.map(({ code, name }) => {
          const converted = convertFromNGN(amount, code);
          return (
            <div key={code} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{CURRENCY_FLAGS[code]}</span>
                <div>
                  <p className="text-sm font-medium text-gray-700">{name}</p>
                  <p className="text-xs text-gray-400">Rate: 1 NGN = {MOCK_RATES[code].toFixed(5)} {code}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {amount > 0 ? formatCurrency(converted, code) : "—"}
                </p>
                <p className="text-xs text-gray-400">per year</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        Indicative rates only. Actual FX rate applied at time of payment.
        All transactions settled in NGN via CBN-licensed escrow.
      </p>
    </div>
  );
}
