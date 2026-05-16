import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { mockConversations, MockConversation } from "@/lib/mock-conversations";
import { MessagesLayout } from "@/components/messages/MessagesLayout";
import { Suspense } from "react";

async function getConversations(userId: string): Promise<MockConversation[]> {
  try {
    const dbConversations = await db.conversation.findMany({
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
      },
    });

    if (dbConversations.length > 0) {
      return dbConversations.map((conv) => ({
        id: conv.id,
        listingId: conv.listingId,
        tenantId: conv.tenantId,
        ownerId: conv.ownerId,
        lastMessageAt: conv.lastMessageAt?.toISOString() ?? null,
        lastMessageText: conv.lastMessageText ?? null,
        tenantUnread: conv.tenantUnread,
        ownerUnread: conv.ownerUnread,
        createdAt: conv.createdAt.toISOString(),
        updatedAt: conv.updatedAt.toISOString(),
        listing: {
          id: conv.listing.id,
          title: conv.listing.title,
          area: conv.listing.area,
          address: conv.listing.address,
          photos: conv.listing.photos,
        },
        tenant: {
          id: conv.tenant.id,
          firstName: conv.tenant.firstName,
          lastName: conv.tenant.lastName,
          profilePhoto: conv.tenant.profilePhoto,
          role: conv.tenant.role as string,
          landlordVerification: conv.tenant.landlordVerification
            ? { badgeTier: conv.tenant.landlordVerification.badgeTier as string }
            : null,
        },
        owner: {
          id: conv.owner.id,
          firstName: conv.owner.firstName,
          lastName: conv.owner.lastName,
          profilePhoto: conv.owner.profilePhoto,
          role: conv.owner.role as string,
          landlordVerification: conv.owner.landlordVerification
            ? { badgeTier: conv.owner.landlordVerification.badgeTier as string }
            : null,
        },
        messages: conv.messages.map((m) => ({
          id: m.id,
          conversationId: m.conversationId,
          senderId: m.senderId,
          type: m.type as "TEXT" | "IMAGE" | "PDF" | "SYSTEM",
          content: m.content,
          mediaUrl: m.mediaUrl ?? null,
          isRead: m.isRead,
          readAt: m.readAt?.toISOString() ?? null,
          systemEventType: m.systemEventType ?? null,
          createdAt: m.createdAt.toISOString(),
          sender: {
            id: m.sender.id,
            firstName: m.sender.firstName,
            lastName: m.sender.lastName,
            profilePhoto: m.sender.profilePhoto,
            role: m.sender.role as string,
          },
        })),
      }));
    }

    // Fallback to mock data
    return mockConversations;
  } catch {
    return mockConversations;
  }
}

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const conversations = await getConversations(session.user.id);

  return (
    <div className="h-full -m-4 sm:-m-6 lg:-m-8">
      <Suspense fallback={null}>
        <MessagesLayout
          initialConversations={conversations}
          currentUserId={session.user.id}
          userRole={session.user.role}
        />
      </Suspense>
    </div>
  );
}
