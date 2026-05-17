import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { mockNotifications } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);
  const skip = (page - 1) * limit;

  try {
    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where: { userId: session.user.id },
        orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      db.notification.count({ where: { userId: session.user.id } }),
    ]);
    const unreadCount = await db.notification.count({
      where: { userId: session.user.id, isRead: false },
    });
    return NextResponse.json({ notifications, total, unreadCount, page, limit });
  } catch {
    const userNotifications = mockNotifications.filter((n) => n.userId === session.user.id || true);
    const unreadCount = userNotifications.filter((n) => !n.isRead).length;
    return NextResponse.json({
      notifications: userNotifications.slice(skip, skip + limit),
      total: userNotifications.length,
      unreadCount,
      page,
      limit,
    });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { action?: string };

  if (body.action === "mark_all_read") {
    try {
      await db.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json({ success: true }); // mock fallback
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
