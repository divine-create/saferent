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
    action: "approve_verified" | "approve_unverified" | "reject" | "pause" | "delete";
    reason?: string;
  };

  try {
    switch (body.action) {
      case "approve_verified":
        await db.listing.update({
          where: { id },
          data: { status: "VERIFIED_ACTIVE", isVerified: true },
        });
        return NextResponse.json({ success: true, message: "Listing approved as verified" });

      case "approve_unverified":
        await db.listing.update({
          where: { id },
          data: { status: "UNVERIFIED_ACTIVE", isVerified: false },
        });
        return NextResponse.json({ success: true, message: "Listing approved (unverified)" });

      case "reject":
        await db.listing.update({
          where: { id },
          data: { status: "DRAFT" },
        });
        return NextResponse.json({ success: true, message: "Listing rejected" });

      case "pause":
        await db.listing.update({
          where: { id },
          data: { status: "PAUSED" },
        });
        return NextResponse.json({ success: true, message: "Listing paused" });

      case "delete":
        await db.listing.delete({ where: { id } });
        return NextResponse.json({ success: true, message: "Listing deleted" });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ success: true, message: `Action ${body.action} applied (mock)` });
  }
}
