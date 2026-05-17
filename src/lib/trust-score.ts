import { db } from "@/lib/db";

export interface TrustScoreBreakdown {
  bvnVerified: number;
  ninVerified: number;
  idDocumentVerified: number;
  employmentVerified: number;
  landlordReference: number;
  rentalHistory: number;
  zeroDisputes: number;
  profileComplete: number;
  total: number;
}

export type TrustScoreBand = "excellent" | "good" | "fair" | "restricted";

export interface TrustScoreResult {
  score: number;
  breakdown: TrustScoreBreakdown;
  band: TrustScoreBand;
  unlockedFeatures: string[];
}

export function getTrustBand(score: number): TrustScoreBand {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "restricted";
}

export function getUnlockedFeatures(band: TrustScoreBand): string[] {
  switch (band) {
    case "excellent":
      return [
        "Installment payments (SafeRent Flex)",
        "Full platform access",
        "Escrow payments",
        "Viewing bookings",
        "Priority support",
      ];
    case "good":
      return [
        "Full platform access",
        "Escrow payments",
        "Viewing bookings",
      ];
    case "fair":
      return [
        "Escrow payments (required)",
        "Viewing bookings",
      ];
    case "restricted":
      return [
        "Browsing listings",
        "Manual review required for transactions",
      ];
  }
}

export async function calculateUserTrustScore(userId: string): Promise<TrustScoreResult> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      tenantTransactions: {
        where: { escrowStatus: "RELEASED" },
        include: { dispute: true },
      },
      raisedDisputes: {
        where: {
          outcome: "FULL_REFUND_TENANT",
        },
      },
    },
  });

  if (!user) {
    return {
      score: 0,
      breakdown: {
        bvnVerified: 0,
        ninVerified: 0,
        idDocumentVerified: 0,
        employmentVerified: 0,
        landlordReference: 0,
        rentalHistory: 0,
        zeroDisputes: 0,
        profileComplete: 0,
        total: 0,
      },
      band: "restricted",
      unlockedFeatures: getUnlockedFeatures("restricted"),
    };
  }

  // BVN verified: 20 pts
  const bvnVerified = user.bvnVerificationStatus === "VERIFIED" ? 20 : 0;

  // NIN verified: 10 pts
  const ninVerified = user.ninVerificationStatus === "VERIFIED" ? 10 : 0;

  // ID document verified: 10 pts
  const idDocumentVerified = user.idDocumentStatus === "VERIFIED" ? 10 : 0;

  // Employment verified: 15 pts (payslip + bank statement)
  const employmentVerified =
    user.profile?.payslipUploaded && user.profile?.bankStatementUploaded ? 15 : 0;

  // Landlord reference: 15 pts (approximated by profile completeness for now)
  // In production this would be a separate verification field
  const landlordReference = 0; // TODO: add dedicated field

  // Rental history: 10 pts per completed tenancy, capped at 30
  const completedTenancies = user.tenantTransactions.length;
  const rentalHistory = Math.min(completedTenancies * 10, 30);

  // Zero disputes: 10 pts (no upheld fraud/deposit disputes)
  const upheldDisputes = user.raisedDisputes.length;
  const zeroDisputes = upheldDisputes === 0 ? 10 : 0;

  // Profile completeness: 0-10 pts
  let profileFields = 0;
  const maxFields = 6;
  if (user.firstName) profileFields++;
  if (user.lastName) profileFields++;
  if (user.email) profileFields++;
  if (user.phone) profileFields++;
  if (user.dateOfBirth) profileFields++;
  if (user.profilePhoto) profileFields++;
  const profileComplete = Math.round((profileFields / maxFields) * 10);

  const total = Math.min(
    bvnVerified +
      ninVerified +
      idDocumentVerified +
      employmentVerified +
      landlordReference +
      rentalHistory +
      zeroDisputes +
      profileComplete,
    100
  );

  const breakdown: TrustScoreBreakdown = {
    bvnVerified,
    ninVerified,
    idDocumentVerified,
    employmentVerified,
    landlordReference,
    rentalHistory,
    zeroDisputes,
    profileComplete,
    total,
  };

  const band = getTrustBand(total);

  return {
    score: total,
    breakdown,
    band,
    unlockedFeatures: getUnlockedFeatures(band),
  };
}
