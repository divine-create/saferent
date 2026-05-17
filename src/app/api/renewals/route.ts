import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tenancyId = searchParams.get("tenancyId");

  try {
    const where =
      session.user.role === "LANDLORD"
        ? { landlordId: session.user.id, ...(tenancyId ? { tenancyId } : {}) }
        : { tenantId: session.user.id, ...(tenancyId ? { tenancyId } : {}) };

    const renewals = await db.leaseRenewal.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    const serialized = renewals.map((r) => ({
      ...r,
      proposedRent: r.proposedRent.toString(),
      currentRent: r.currentRent.toString(),
      tenantCounter: r.tenantCounter?.toString() ?? null,
    }));
    return NextResponse.json({ renewals: serialized });
  } catch (err) {
    console.error("Failed to fetch renewals:", err);
    return NextResponse.json({ error: "Failed to fetch renewals" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "LANDLORD") {
    return NextResponse.json({ error: "Only landlords can propose renewals" }, { status: 403 });
  }

  const body = await req.json() as {
    tenancyId: string;
    tenantId: string;
    proposedRent: string;
    currentRent: string;
    renewalStartDate: string;
    renewalEndDate: string;
  };

  const {
    tenancyId,
    tenantId,
    proposedRent,
    currentRent,
    renewalStartDate,
    renewalEndDate,
  } = body;

  if (!tenancyId || !tenantId || !proposedRent || !currentRent || !renewalStartDate || !renewalEndDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const renewal = await db.leaseRenewal.create({
      data: {
        tenancyId,
        landlordId: session.user.id,
        tenantId,
        proposedRent: BigInt(proposedRent),
        currentRent: BigInt(currentRent),
        renewalStartDate: new Date(renewalStartDate),
        renewalEndDate: new Date(renewalEndDate),
        status: "proposed",
      },
    });
    return NextResponse.json(
      {
        renewal: {
          ...renewal,
          proposedRent: renewal.proposedRent.toString(),
          currentRent: renewal.currentRent.toString(),
          tenantCounter: renewal.tenantCounter?.toString() ?? null,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Failed to create renewal:", err);
    return NextResponse.json({ error: "Failed to create renewal" }, { status: 500 });
  }
}
