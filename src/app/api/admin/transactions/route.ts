import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const mockTransactions = [
  {
    id: "txn_001",
    reference: "SR-2024-ABC12",
    tenant: { firstName: "Chidi", lastName: "Okonkwo" },
    landlord: { firstName: "Amaka", lastName: "Eze" },
    listing: { title: "3 Bedroom Flat, Lekki Phase 1" },
    rentAmount: BigInt(350000000),
    totalAmount: BigInt(387500000),
    safeRentFee: BigInt(17500000),
    escrowStatus: "FUNDED",
    paymentDate: new Date("2024-11-20"),
    moveInDate: new Date("2024-12-01"),
    escrowReleasedAt: null,
    payoutSentAt: null,
    createdAt: new Date("2024-11-18"),
  },
  {
    id: "txn_002",
    reference: "SR-2024-XYZ99",
    tenant: { firstName: "Ngozi", lastName: "Adeyemi" },
    landlord: { firstName: "Tunde", lastName: "Bakare" },
    listing: { title: "Self-Contained Studio, Victoria Island" },
    rentAmount: BigInt(180000000),
    totalAmount: BigInt(207000000),
    safeRentFee: BigInt(9000000),
    escrowStatus: "DISPUTED",
    paymentDate: new Date("2024-11-10"),
    moveInDate: new Date("2024-11-15"),
    escrowReleasedAt: null,
    payoutSentAt: null,
    createdAt: new Date("2024-11-08"),
  },
  {
    id: "txn_003",
    reference: "SR-2024-DEF34",
    tenant: { firstName: "Kola", lastName: "Adeola" },
    landlord: { firstName: "Amaka", lastName: "Eze" },
    listing: { title: "2 Bedroom Flat, Surulere" },
    rentAmount: BigInt(200000000),
    totalAmount: BigInt(219000000),
    safeRentFee: BigInt(10000000),
    escrowStatus: "RELEASED",
    paymentDate: new Date("2024-10-01"),
    moveInDate: new Date("2024-10-05"),
    escrowReleasedAt: new Date("2024-11-05"),
    payoutSentAt: new Date("2024-11-06"),
    createdAt: new Date("2024-09-28"),
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

    return NextResponse.json({ transactions });
  } catch {
    const filtered = status === "ALL" ? mockTransactions : mockTransactions.filter((t) => t.escrowStatus === status);
    return NextResponse.json({ transactions: filtered });
  }
}
