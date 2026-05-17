import { db } from "@/lib/db";

export const mockReviews = [
  {
    id: "mock_review_1",
    reviewerId: "mock_tenant_1",
    revieweeId: "u1",
    transactionId: "mock_tx_2",
    type: "tenant_of_landlord",
    overallRating: 4,
    conditionRating: 4,
    responsivenessRating: 5,
    accuracyRating: 4,
    valueRating: 3,
    paymentRating: null,
    careRating: null,
    comment: "Great landlord, very responsive to maintenance requests. The property was exactly as described. A few minor issues with water pressure that were quickly resolved.",
    response: "Thank you for the kind review! It was a pleasure having you as a tenant. You are welcome to renew anytime.",
    isPublished: true,
    isFlagged: false,
    createdAt: "2026-04-15T10:00:00.000Z",
    updatedAt: "2026-04-16T14:00:00.000Z",
    reviewer: { firstName: "Chukwuemeka", lastName: "Okafor" },
    reviewee: { firstName: "Adaeze", lastName: "Okonkwo" },
  },
  {
    id: "mock_review_2",
    reviewerId: "u1",
    revieweeId: "mock_tenant_2",
    transactionId: "mock_tx_2",
    type: "landlord_of_tenant",
    overallRating: 5,
    conditionRating: null,
    responsivenessRating: null,
    accuracyRating: null,
    valueRating: null,
    paymentRating: 5,
    careRating: 5,
    comment: "Excellent tenant. Always paid on time, kept the property in great condition, and was respectful of neighbours. Would gladly rent to again.",
    response: null,
    isPublished: true,
    isFlagged: false,
    createdAt: "2026-04-10T09:00:00.000Z",
    updatedAt: "2026-04-10T09:00:00.000Z",
    reviewer: { firstName: "Adaeze", lastName: "Okonkwo" },
    reviewee: { firstName: "Amaka", lastName: "Eze" },
  },
];

export async function getReviewsForUser(userId: string) {
  try {
    return await db.review.findMany({
      where: { revieweeId: userId, isPublished: true },
      include: {
        reviewer: { select: { firstName: true, lastName: true, profilePhoto: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return mockReviews.filter((r) => r.revieweeId === userId);
  }
}
