import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/conversations/[id] — fetch single conversation with all messages
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = session.user.id;

  try {
    const conversation = await db.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePhoto: true,
                role: true,
              },
            },
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            area: true,
            address: true,
            photos: { take: 1, orderBy: { order: "asc" }, select: { url: true } },
          },
        },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
            role: true,
            landlordVerification: { select: { badgeTier: true } },
          },
        },
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
            role: true,
            landlordVerification: { select: { badgeTier: true } },
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Auth: only tenant or owner may access
    if (conversation.tenantId !== userId && conversation.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const isTenant = conversation.tenantId === userId;

    // Mark messages from the other party as read
    await db.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true, readAt: new Date() },
    });

    // Reset unread counter for current user
    await db.conversation.update({
      where: { id },
      data: isTenant ? { tenantUnread: 0 } : { ownerUnread: 0 },
    });

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("[GET /api/conversations/[id]]", error);
    return NextResponse.json({ error: "Failed to fetch conversation" }, { status: 500 });
  }
}
