import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { serializePrisma } from "@/lib/serialize";

const mockTransactions = [
  {
    id: "txn_001",
    reference: "SR-2024-ABC12",
    tenant: { firstName: "Chidi", lastName: "Okonkwo" },
    landlord: { firstName: "Amaka", lastName: "Eze" },
    listing: { title: "3 Bedroom Flat, Lekki Phase 1" },
    rentAmount: 350000000,
    totalAmount: 387500000,
    safeRentFee: 17500000,
    escrowStatus: "FUNDED",
    paymentDate: "2024-11-20T00:00:00.000Z",
    moveInDate: "2024-12-01T00:00:00.000Z",
    escrowReleasedAt: null,
    payoutSentAt: null,
    createdAt: "2024-11-18T00:00:00.000Z",
  },
  {
    id: "txn_002",
    reference: "SR-2024-XYZ99",
    tenant: { firstName: "Ngozi", lastName: "Adeyemi" },
    landlord: { firstName: "Tunde", lastName: "Bakare" },
    listing: { title: "Self-Contained Studio, Victoria Island" },
    rentAmount: 180000000,
    totalAmount: 207000000,
    safeRentFee: 9000000,
    escrowStatus: "DISPUTED",
    paymentDate: "2024-11-10T00:00:00.000Z",
    moveInDate: "2024-11-15T00:00:00.000Z",
    escrowReleasedAt: null,
    payoutSentAt: null,
    createdAt: "2024-11-08T00:00:00.000Z",
  },
  {
    id: "txn_003",
    reference: "SR-2024-DEF34",
    tenant: { firstName: "Kola", lastName: "Adeola" },
    landlord: { firstName: "Amaka", lastName: "Eze" },
    listing: { title: "2 Bedroom Flat, Surulere" },
    rentAmount: 200000000,
    totalAmount: 219000000,
    safeRentFee: 10000000,
    escrowStatus: "RELEASED",
    paymentDate: "2024-10-01T00:00:00.000Z",
    moveInDate: "2024-10-05T00:00:00.000Z",
    escrowReleasedAt: "2024-11-05T00:00:00.000Z",
    payoutSentAt: "2024-11-06T00:00:00.000Z",
    createdAt: "2024-09-28T00:00:00.000Z",
  },
];

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "ALL";

  try {
    const where: Record<string, unknown> = {};
    if (status !== "ALL") where.escrowStatus = status;

    const transactions = await db.escrowTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        tenant: { select: { firstName: true, lastName: true } },
        landlord: { select: { firstName: true, lastName: true } },
        listing: { select: { title: true, address: true } },
      },
    });

    return NextResponse.json({ transactions: serializePrisma(transactions) });
  } catch {
    const filtered = status === "ALL" ? mockTransactions : mockTransactions.filter((t) => t.escrowStatus === status);
    return NextResponse.json({ transactions: filtered });
  }
}
