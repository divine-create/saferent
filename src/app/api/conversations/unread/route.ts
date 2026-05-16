import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/conversations/unread — total unread message count for the current user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const [tenantResult, ownerResult] = await Promise.all([
      db.conversation.aggregate({
        where: { tenantId: userId },
        _sum: { tenantUnread: true },
      }),
      db.conversation.aggregate({
        where: { ownerId: userId },
        _sum: { ownerUnread: true },
      }),
    ]);

    const total =
      (tenantResult._sum.tenantUnread ?? 0) +
      (ownerResult._sum.ownerUnread ?? 0);

    return NextResponse.json({ unread: total });
  } catch (error) {
    console.error("[GET /api/conversations/unread]", error);
    return NextResponse.json({ unread: 0 });
  }
}
