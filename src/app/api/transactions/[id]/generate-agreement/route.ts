import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { generateAgreementPdf } from "@/lib/generate-agreement-pdf";

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  state: z.enum(["Lagos", "Abuja FCT", "Other"]),
  paymentFrequency: z.enum(["ANNUAL", "BIANNUAL", "QUARTERLY", "MONTHLY"]),
});

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = bodySchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", issues: result.error.issues }, { status: 422 });
  }

  const { state, paymentFrequency } = result.data;

  try {
    const transaction = await db.escrowTransaction.findUnique({
      where: { id },
      include: {
        listing: { select: { address: true, area: true, state: true, lga: true } },
        tenant: { select: { firstName: true, lastName: true, email: true, phone: true } },
        landlord: { select: { firstName: true, lastName: true, email: true, phone: true } },
      },
    });

    if (!transaction) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

    if (
      transaction.tenantId !== session.user.id &&
      transaction.landlordId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (transaction.escrowStatus !== "FUNDED") {
      return NextResponse.json(
        { error: "Payment must be confirmed before generating agreement" },
        { status: 400 }
      );
    }

    // Return existing agreement if already generated
    const existing = await db.tenancyAgreement.findUnique({ where: { transactionId: id } });
    if (existing) {
      return NextResponse.json({
        agreement: {
          ...existing,
          rentAmount: existing.rentAmount.toString(),
          cautionDeposit: existing.cautionDeposit.toString(),
        },
      });
    }

    const tenantName = [transaction.tenant.firstName, transaction.tenant.lastName].filter(Boolean).join(" ") || "Tenant";
    const landlordName = [transaction.landlord.firstName, transaction.landlord.lastName].filter(Boolean).join(" ") || "Landlord";
    const propertyAddress = `${transaction.listing.address}, ${transaction.listing.area}, ${transaction.listing.lga}, ${transaction.listing.state}`;

    const tenancyStart = transaction.tenancyStartDate ?? transaction.moveInDate;
    const tenancyEnd = transaction.tenancyEndDate ?? (() => {
      const d = new Date(tenancyStart);
      d.setFullYear(d.getFullYear() + 1);
      return d;
    })();

    // Generate PDF
    const pdfBuffer = await generateAgreementPdf({
      reference: transaction.reference,
      tenantLegalName: tenantName,
      landlordLegalName: landlordName,
      tenantEmail: transaction.tenant.email ?? "",
      landlordEmail: transaction.landlord.email ?? "",
      tenantPhone: transaction.tenant.phone,
      landlordPhone: transaction.landlord.phone,
      propertyAddress,
      tenancyStartDate: tenancyStart,
      tenancyEndDate: tenancyEnd,
      rentAmount: transaction.rentAmount,
      paymentFrequency,
      cautionDeposit: transaction.cautionAmount,
      latePaymentPenalty: 5,
      noticePeriodDays: 30,
      state,
      generatedAt: new Date(),
    });

    const pdfBase64 = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;

    const agreement = await db.tenancyAgreement.create({
      data: {
        transactionId: id,
        tenantLegalName: tenantName,
        landlordLegalName: landlordName,
        tenantAddress: transaction.tenant.email ?? "",
        landlordAddress: transaction.landlord.email ?? "",
        propertyAddress,
        tenancyStartDate: tenancyStart,
        tenancyEndDate: tenancyEnd,
        rentAmount: transaction.rentAmount,
        paymentFrequency,
        cautionDeposit: transaction.cautionAmount,
        latePaymentPenalty: 5,
        noticePeriodDays: 30,
        state,
        pdfUrl: pdfBase64,
      },
    });

    return NextResponse.json({
      agreement: {
        ...agreement,
        rentAmount: agreement.rentAmount.toString(),
        cautionDeposit: agreement.cautionDeposit.toString(),
      },
    });
  } catch (err) {
    console.error("Failed to generate agreement:", err);
    return NextResponse.json({ error: "Failed to generate agreement" }, { status: 500 });
  }
}

// GET endpoint to download the PDF directly
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const agreement = await db.tenancyAgreement.findUnique({
    where: { transactionId: id },
    include: {
      transaction: { select: { tenantId: true, landlordId: true, reference: true } },
    },
  });

  if (!agreement) return NextResponse.json({ error: "Agreement not found" }, { status: 404 });

  if (
    agreement.transaction.tenantId !== session.user.id &&
    agreement.transaction.landlordId !== session.user.id &&
    session.user.role !== "ADMIN"
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!agreement.pdfUrl?.startsWith("data:application/pdf;base64,")) {
    return NextResponse.json({ error: "PDF not yet generated" }, { status: 404 });
  }

  const base64 = agreement.pdfUrl.replace("data:application/pdf;base64,", "");
  const buffer = Buffer.from(base64, "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="saferent-agreement-${agreement.transaction.reference}.pdf"`,
      "Content-Length": buffer.length.toString(),
    },
  });
}
