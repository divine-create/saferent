import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const revieweeId = searchParams.get("revieweeId");

  try {
    const reviews = await db.review.findMany({
      where: {
        isPublished: true,
        ...(revieweeId ? { revieweeId } : {}),
      },
      include: {
        reviewer: { select: { firstName: true, lastName: true, profilePhoto: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ reviews });
  } catch (err) {
    console.error("Failed to fetch reviews:", err);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    revieweeId: string;
    transactionId?: string;
    type: string;
    overallRating: number;
    conditionRating?: number;
    responsivenessRating?: number;
    accuracyRating?: number;
    valueRating?: number;
    paymentRating?: number;
    careRating?: number;
    comment?: string;
  };

  const { revieweeId, type, overallRating } = body;
  if (!revieweeId || !type || !overallRating) {
    return NextResponse.json({ error: "revieweeId, type, overallRating required" }, { status: 400 });
  }
  if (overallRating < 1 || overallRating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }

  try {
    const review = await db.review.create({
      data: {
        reviewerId: session.user.id,
        revieweeId,
        transactionId: body.transactionId ?? null,
        type,
        overallRating,
        conditionRating: body.conditionRating ?? null,
        responsivenessRating: body.responsivenessRating ?? null,
        accuracyRating: body.accuracyRating ?? null,
        valueRating: body.valueRating ?? null,
        paymentRating: body.paymentRating ?? null,
        careRating: body.careRating ?? null,
        comment: body.comment ?? null,
      },
    });
    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    console.error("Failed to create review:", err);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
