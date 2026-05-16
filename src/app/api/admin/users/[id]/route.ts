import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { mockAdminUsers } from "@/lib/mock-admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const user = await db.user.findUnique({
      where: { id },
      include: {
        profile: true,
        landlordVerification: true,
        agentProfile: true,
        ownedListings: {
          select: { id: true, title: true, status: true, annualRent: true, createdAt: true },
          take: 10,
        },
        tenantTransactions: {
          select: { id: true, reference: true, rentAmount: true, escrowStatus: true, createdAt: true, listing: { select: { title: true, address: true } } },
          take: 10,
          orderBy: { createdAt: "desc" },
        },
        raisedDisputes: {
          select: { id: true, category: true, status: true, createdAt: true, transaction: { select: { reference: true } } },
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ user });
  } catch {
    const user = mockAdminUsers.find((u) => u.id === id);
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ user });
  }
}
