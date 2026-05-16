import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function formatPhoneNumber(phone: string): string {
  // Format Nigerian phone numbers
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("234")) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith("0")) {
    return `+234${cleaned.slice(1)}`;
  }
  return `+234${cleaned}`;
}

export function maskPhone(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length >= 4) {
    return `****${cleaned.slice(-4)}`;
  }
  return phone;
}

export function maskEmail(email: string): string {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const masked = local.slice(0, 2) + "****";
  return `${masked}@${domain}`;
}

export function generateTransactionRef(): string {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 5; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `SR-${year}-${suffix}`;
}

export function calculateEscrowBreakdown(annualRent: bigint, cautionDeposit: bigint) {
  const safeRentFee = (annualRent * BigInt(5)) / BigInt(100);
  const documentFee = BigInt(800000); // ₦8,000 in kobo
  const total = annualRent + cautionDeposit + safeRentFee + documentFee;
  return { rentAmount: annualRent, cautionAmount: cautionDeposit, safeRentFee, documentFee, total };
}

export function formatKoboToNaira(kobo: bigint): string {
  const naira = Number(kobo) / 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(naira);
}

export function calculateTrustScore(params: {
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  bvnVerified: boolean;
  idDocumentVerified: boolean;
  bankStatementUploaded?: boolean;
}): number {
  let score = 0;
  if (params.isEmailVerified) score += 10;
  if (params.isPhoneVerified) score += 15;
  if (params.bvnVerified) score += 40;
  if (params.idDocumentVerified) score += 25;
  if (params.bankStatementUploaded) score += 10;
  return Math.min(score, 100);
}
