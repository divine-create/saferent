import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tenancyId = searchParams.get("tenancyId");

  try {
    const inspections = await db.propertyInspection.findMany({
      where: {
        ...(session.user.role === "LANDLORD" ? { landlordId: session.user.id } : {}),
        ...(tenancyId ? { tenancyId } : {}),
      },
      orderBy: { scheduledDate: "desc" },
    });
    return NextResponse.json({ inspections });
  } catch (err) {
    console.error("Failed to fetch inspections:", err);
    return NextResponse.json({ error: "Failed to fetch inspections" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "LANDLORD") {
    return NextResponse.json({ error: "Only landlords can schedule inspections" }, { status: 403 });
  }

  const body = await req.json() as {
    tenancyId: string;
    scheduledDate: string;
    notes?: string;
  };
  const { tenancyId, scheduledDate, notes } = body;

  if (!tenancyId || !scheduledDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const scheduled = new Date(scheduledDate);
  const now = new Date();
  const hoursDiff = (scheduled.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursDiff < 24) {
    return NextResponse.json(
      { error: "Inspection must be scheduled at least 24 hours in advance" },
      { status: 400 }
    );
  }

  try {
    const inspection = await db.propertyInspection.create({
      data: {
        tenancyId,
        landlordId: session.user.id,
        scheduledDate: scheduled,
        noticeGivenAt: now,
        notes: notes ?? null,
        photoUrls: [],
      },
    });
    return NextResponse.json({ inspection }, { status: 201 });
  } catch (err) {
    console.error("Failed to create inspection:", err);
    return NextResponse.json({ error: "Failed to schedule inspection" }, { status: 500 });
  }
}
