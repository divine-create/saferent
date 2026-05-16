import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { mockAdminUsers, mockPendingListings } from "@/lib/mock-admin";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "all";

  try {
    const [identityUsers, pendingListings] = await Promise.all([
      type !== "listing"
        ? db.user.findMany({
            where: {
              OR: [
                { bvnVerificationStatus: "PENDING" },
                { idDocumentStatus: "PENDING" },
              ],
            },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              role: true,
              bvnVerificationStatus: true,
              idDocumentStatus: true,
              createdAt: true,
              profile: { select: { governmentIdType: true } },
            },
            orderBy: { createdAt: "asc" },
          })
        : Promise.resolve([]),
      type !== "user"
        ? db.listing.findMany({
            where: { status: "PENDING_VERIFICATION" },
            include: {
              owner: { select: { firstName: true, lastName: true } },
            },
            orderBy: { createdAt: "asc" },
          })
        : Promise.resolve([]),
    ]);

    return NextResponse.json({ identityUsers, pendingListings });
  } catch {
    const identityUsers = mockAdminUsers.filter(
      (u) => (u.bvnVerificationStatus as string) === "PENDING" || (u.idDocumentStatus as string) === "PENDING"
    );
    return NextResponse.json({ identityUsers, pendingListings: mockPendingListings });
  }
}
