import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import type { InspectionStatus } from "@prisma/client";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "LANDLORD") {
    return NextResponse.json({ error: "Only landlords can update inspections" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json() as {
    status: InspectionStatus;
    notes?: string;
    reportData?: Record<string, unknown>;
  };

  try {
    const inspection = await db.propertyInspection.findUnique({ where: { id } });
    if (!inspection) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (inspection.landlordId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await db.propertyInspection.update({
      where: { id },
      data: {
        status: body.status,
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
        ...(body.reportData ? { reportData: body.reportData as object } : {}),
        ...(body.status === "COMPLETED" ? { completedAt: new Date() } : {}),
      },
    });
    return NextResponse.json({ inspection: updated });
  } catch (err) {
    console.error("Failed to update inspection:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
