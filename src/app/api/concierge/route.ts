import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as {
    listingId?: string;
    listingUrl?: string;
    inspectionDateFrom?: string;
    inspectionDateTo?: string;
    whatsappNumber: string;
    message?: string;
  };

  if (!body.whatsappNumber) {
    return NextResponse.json({ error: "WhatsApp number is required" }, { status: 400 });
  }

  const booking = await db.conciergeBooking.create({
    data: {
      userId: session.user.id,
      listingId: body.listingId ?? null,
      listingUrl: body.listingUrl ?? null,
      inspectionDateFrom: body.inspectionDateFrom ? new Date(body.inspectionDateFrom) : null,
      inspectionDateTo: body.inspectionDateTo ? new Date(body.inspectionDateTo) : null,
      whatsappNumber: body.whatsappNumber,
      message: body.message ?? null,
      status: "pending",
    },
  });

  return NextResponse.json({ booking, success: true });
}
