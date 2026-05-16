import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

type RouteParams = { params: Promise<{ id: string }> };

// URL regex — matches http(s):// or www. patterns
const URL_REGEX = /(?:https?:\/\/|www\.)\S+/i;

// POST /api/conversations/[id]/messages — send a new message
export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: conversationId } = await params;
  const userId = session.user.id;

  let body: { content?: string; type?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { content, type = "TEXT" } = body;

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "Message content cannot be empty" }, { status: 400 });
  }

  // Security: no external links
  if (URL_REGEX.test(content)) {
    return NextResponse.json(
      { error: "External links are not allowed for security reasons" },
      { status: 400 }
    );
  }

  try {
    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      select: { tenantId: true, ownerId: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Auth: must be tenant or owner
    if (conversation.tenantId !== userId && conversation.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const isTenant = conversation.tenantId === userId;
    const trimmed = content.trim();

    // Create the message
    const message = await db.message.create({
      data: {
        conversationId,
        senderId: userId,
        type: type as "TEXT" | "IMAGE" | "PDF" | "SYSTEM",
        content: trimmed,
      },
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
    });

    // Update conversation denormalised fields + increment other party's unread
    await db.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: message.createdAt,
        lastMessageText: trimmed.slice(0, 200),
        ...(isTenant
          ? { ownerUnread: { increment: 1 } }
          : { tenantUnread: { increment: 1 } }),
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/conversations/[id]/messages]", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
