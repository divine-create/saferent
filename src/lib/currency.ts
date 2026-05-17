export type Currency = "NGN" | "USD" | "GBP" | "EUR" | "CAD"

export const SUPPORTED_CURRENCIES: Currency[] = ["NGN", "USD", "GBP", "EUR", "CAD"]

// Mock exchange rates (real implementation would fetch from API)
export const MOCK_RATES: Record<Currency, number> = {
  NGN: 1,
  USD: 0.00063,   // 1 NGN = 0.00063 USD (approx ₦1,600/$1)
  GBP: 0.00050,
  EUR: 0.00058,
  CAD: 0.00086,
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
  EUR: "€",
  CAD: "C$",
}

export const CURRENCY_FLAGS: Record<Currency, string> = {
  NGN: "🇳🇬",
  USD: "🇺🇸",
  GBP: "🇬🇧",
  EUR: "🇪🇺",
  CAD: "🇨🇦",
}

export function convertFromNGN(amountNGN: number, toCurrency: Currency): number {
  const rate = MOCK_RATES[toCurrency]
  return amountNGN * rate
}

export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_SYMBOLS[currency]
}

export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency]
  if (currency === "NGN") {
    // Format as ₦1,200,000
    return `${symbol}${Math.round(amount).toLocaleString("en-NG")}`
  }
  // Format with 2 decimal places for foreign currencies
  return `${symbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
}

export function formatInCurrency(amountNGN: number, currency: Currency): string {
  const converted = convertFromNGN(amountNGN, currency)
  return formatCurrency(converted, currency)
}
