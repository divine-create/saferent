import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/conversations — list all conversations for the current user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const conversations = await db.conversation.findMany({
      where: {
        OR: [{ tenantId: userId }, { ownerId: userId }],
      },
      orderBy: { lastMessageAt: "desc" },
      include: {
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

    // Attach unread count specific to the current user
    const result = conversations.map((conv) => ({
      ...conv,
      unreadCount: conv.tenantId === userId ? conv.tenantUnread : conv.ownerUnread,
    }));

    return NextResponse.json({ conversations: result });
  } catch (error) {
    console.error("[GET /api/conversations]", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

// POST /api/conversations — create or find existing conversation
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  let body: { listingId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { listingId } = body;
  if (!listingId) {
    return NextResponse.json({ error: "listingId is required" }, { status: 400 });
  }

  try {
    // Fetch listing and owner
    const listing = await db.listing.findUnique({
      where: { id: listingId },
      select: { id: true, title: true, ownerId: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const ownerId = listing.ownerId;

    // Users cannot message themselves
    if (userId === ownerId) {
      return NextResponse.json({ error: "Cannot start a conversation with yourself" }, { status: 400 });
    }

    // Check for existing conversation
    const existing = await db.conversation.findUnique({
      where: {
        listingId_tenantId_ownerId: {
          listingId,
          tenantId: userId,
          ownerId,
        },
      },
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

    if (existing) {
      return NextResponse.json({ conversation: existing, created: false });
    }

    // Create new conversation
    const systemContent = `Conversation started about ${listing.title}`;
    const now = new Date();

    const conversation = await db.conversation.create({
      data: {
        listingId,
        tenantId: userId,
        ownerId,
        lastMessageAt: now,
        lastMessageText: systemContent.slice(0, 200),
        messages: {
          create: {
            senderId: userId, // system messages attributed to initiating user for FK constraint
            type: "SYSTEM",
            content: systemContent,
            systemEventType: "CONVERSATION_STARTED",
            isRead: true,
          },
        },
      },
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

    return NextResponse.json({ conversation, created: true }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/conversations]", error);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
