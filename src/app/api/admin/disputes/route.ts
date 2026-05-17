import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { mockOpenDisputes } from "@/lib/mock-admin";
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
    if (status !== "ALL") {
      where.status = status;
    }

    const disputes = await db.dispute.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        raisedBy: { select: { firstName: true, lastName: true, trustScore: true } },
        transaction: {
          select: {
            reference: true,
            rentAmount: true,
            tenant: { select: { firstName: true, lastName: true } },
            landlord: { select: { firstName: true, lastName: true } },
            listing: { select: { address: true, title: true } },
          },
        },
      },
    });

    return NextResponse.json({ disputes: serializePrisma(disputes) });
  } catch {
    const filtered = status === "ALL"
      ? mockOpenDisputes
      : mockOpenDisputes.filter((d) => d.status === status);
    return NextResponse.json({ disputes: filtered });
  }
}
