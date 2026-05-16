import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateTransactionRef, calculateEscrowBreakdown } from "@/lib/utils";
import { z } from "zod";

const initiateSchema = z.object({
  listingId: z.string().min(1),
  paymentMethod: z.enum(["CARD", "BANK_TRANSFER", "USSD"]),
  moveInDate: z.string().refine((d) => !isNaN(Date.parse(d)), { message: "Invalid date" }),
  tenancyMonths: z.number().int().min(1).max(24).default(12),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "TENANT") {
    return NextResponse.json({ error: "Only tenants can initiate payments" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = initiateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", issues: result.error.issues }, { status: 422 });
  }

  const { listingId, paymentMethod, moveInDate, tenancyMonths } = result.data;
  const moveIn = new Date(moveInDate);

  if (moveIn <= new Date()) {
    return NextResponse.json({ error: "Move-in date must be in the future" }, { status: 422 });
  }

  try {
    const listing = await db.listing.findUnique({
      where: { id: listingId },
      include: { owner: { select: { id: true, firstName: true, lastName: true } } },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.status !== "VERIFIED_ACTIVE" && listing.status !== "UNVERIFIED_ACTIVE") {
      return NextResponse.json({ error: "Listing is not available for rent" }, { status: 400 });
    }

    // Check for existing transaction
    const existing = await db.escrowTransaction.findFirst({
      where: { listingId, tenantId: session.user.id, escrowStatus: { in: ["PENDING_PAYMENT", "FUNDED"] } },
    });
    if (existing) {
      return NextResponse.json({ error: "You already have an active transaction for this listing" }, { status: 409 });
    }

    const annualRent = listing.annualRent;
    const cautionDeposit = listing.cautionDeposit ?? BigInt(0);
    const breakdown = calculateEscrowBreakdown(annualRent, cautionDeposit);
    const reference = generateTransactionRef();

    // tenancy dates
    const tenancyStartDate = moveIn;
    const tenancyEndDate = new Date(moveIn);
    tenancyEndDate.setMonth(tenancyEndDate.getMonth() + tenancyMonths);

    const transaction = await db.escrowTransaction.create({
      data: {
        reference,
        listingId,
        tenantId: session.user.id,
        landlordId: listing.ownerId,
        rentAmount: breakdown.rentAmount,
        cautionAmount: breakdown.cautionAmount,
        safeRentFee: breakdown.safeRentFee,
        documentFee: breakdown.documentFee,
        totalAmount: breakdown.total,
        paymentMethod,
        escrowStatus: "PENDING_PAYMENT",
        moveInDate: moveIn,
        tenancyStartDate,
        tenancyEndDate,
        moveInRecord: {
          create: {
            scheduledDate: moveIn,
            status: "SCHEDULED",
          },
        },
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            photos: { take: 1, orderBy: { order: "asc" } },
          },
        },
        tenant: { select: { id: true, firstName: true, lastName: true, email: true } },
        landlord: { select: { id: true, firstName: true, lastName: true, email: true } },
        moveInRecord: true,
      },
    });

    const paymentInstructions = {
      bankName: "GTBank",
      accountNumber: "0123456789",
      accountName: "SafeRent Escrow Trust Account",
      amount: breakdown.total.toString(),
      reference,
      ussdCode: `*737*1*${(Number(breakdown.total) / 100).toFixed(0)}*${reference}#`,
    };

    return NextResponse.json(
      {
        transaction: {
          ...transaction,
          rentAmount: transaction.rentAmount.toString(),
          cautionAmount: transaction.cautionAmount.toString(),
          safeRentFee: transaction.safeRentFee.toString(),
          documentFee: transaction.documentFee.toString(),
          totalAmount: transaction.totalAmount.toString(),
        },
        paymentInstructions,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Failed to initiate transaction:", err);
    return NextResponse.json({ error: "Failed to initiate transaction" }, { status: 500 });
  }
}
