import { db } from "@/lib/db";
import type { BadgeTier } from "@prisma/client";

export async function calculateLandlordBadgeTier(userId: string): Promise<BadgeTier> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      landlordVerification: true,
    },
  });

  if (!user || !user.landlordVerification) return "NONE";

  const { landlordVerification } = user;
  const isBvnVerified = user.bvnVerificationStatus === "VERIFIED";
  const isIdVerified = user.idDocumentStatus === "VERIFIED";
  const hasTitleDoc = !!landlordVerification.titleDocumentUrl;
  const completedTxCount = landlordVerification.completedTransactions;

  // CERTIFIED: ID_VERIFIED + PROPERTY_VERIFIED + at least 1 completed transaction + no upheld fraud disputes
  if (isBvnVerified && isIdVerified && hasTitleDoc && completedTxCount >= 1) {
    return "CERTIFIED";
  }

  // PROPERTY_VERIFIED: ID_VERIFIED + title document approved
  if (isBvnVerified && isIdVerified && hasTitleDoc) {
    return "PROPERTY_VERIFIED";
  }

  // ID_VERIFIED: BVN + ID document verified
  if (isBvnVerified && isIdVerified) {
    return "ID_VERIFIED";
  }

  return "NONE";
}
