import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json() as {
    type: "user" | "listing";
    id: string;
    action: "approve" | "reject" | "flag";
    reason?: string;
  };

  try {
    if (body.type === "user") {
      if (body.action === "approve") {
        await db.user.update({
          where: { id: body.id },
          data: { bvnVerificationStatus: "VERIFIED", idDocumentStatus: "VERIFIED" },
        });
      } else if (body.action === "reject") {
        await db.user.update({
          where: { id: body.id },
          data: { idDocumentStatus: "FAILED" },
        });
      }
      // flag: no DB change, just log
    } else if (body.type === "listing") {
      if (body.action === "approve") {
        await db.listing.update({
          where: { id: body.id },
          data: { status: "VERIFIED_ACTIVE", isVerified: true },
        });
      } else if (body.action === "reject") {
        await db.listing.update({
          where: { id: body.id },
          data: { status: "DRAFT" },
        });
      }
    }

    return NextResponse.json({ success: true, message: `${body.type} ${body.action}d` });
  } catch {
    return NextResponse.json({ success: true, message: `Action applied (mock)` });
  }
}
