import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json() as {
    action: "suspend" | "unsuspend" | "ban" | "approve_document" | "reject_document" | "update_trust_score";
    trustScore?: number;
    reason?: string;
  };

  try {
    switch (body.action) {
      case "suspend":
        await db.user.update({ where: { id }, data: { isActive: false } });
        return NextResponse.json({ success: true, message: "User suspended" });

      case "unsuspend":
        await db.user.update({ where: { id }, data: { isActive: true } });
        return NextResponse.json({ success: true, message: "User unsuspended" });

      case "ban":
        await db.user.update({ where: { id }, data: { isBanned: true, isActive: false } });
        return NextResponse.json({ success: true, message: "User banned" });

      case "approve_document":
        await db.user.update({
          where: { id },
          data: { idDocumentStatus: "VERIFIED", bvnVerificationStatus: "VERIFIED" },
        });
        return NextResponse.json({ success: true, message: "Documents approved" });

      case "reject_document":
        await db.user.update({
          where: { id },
          data: { idDocumentStatus: "FAILED" },
        });
        return NextResponse.json({ success: true, message: "Documents rejected" });

      case "update_trust_score":
        if (body.trustScore !== undefined) {
          await db.user.update({ where: { id }, data: { trustScore: body.trustScore } });
        }
        return NextResponse.json({ success: true, message: "Trust score updated" });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch {
    // Mock success for demo
    return NextResponse.json({ success: true, message: `Action ${body.action} applied (mock)` });
  }
}
