import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { serializePrisma } from "@/lib/serialize";

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
  } catch (err) {
    console.error("Failed to fetch admin transactions:", err);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
