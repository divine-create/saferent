import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { mockMaintenanceRequests } from "@/lib/mock-property";
import type { MaintenanceStatus } from "@prisma/client";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const request = await db.maintenanceRequest.findUnique({ where: { id } });
    if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ request });
  } catch {
    const mock = mockMaintenanceRequests.find((r) => r.id === id);
    if (!mock) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ request: mock });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const body = await req.json() as {
    status?: MaintenanceStatus;
    landlordNotes?: string;
    scheduledDate?: string;
    tenantConfirmed?: boolean;
  };

  try {
    const existing = await db.maintenanceRequest.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Authorization check
    if (session.user.role === "TENANT" && existing.tenantId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (session.user.role === "LANDLORD" && existing.landlordId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await db.maintenanceRequest.update({
      where: { id },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.landlordNotes !== undefined ? { landlordNotes: body.landlordNotes } : {}),
        ...(body.scheduledDate ? { scheduledDate: new Date(body.scheduledDate) } : {}),
        ...(body.tenantConfirmed !== undefined ? { tenantConfirmed: body.tenantConfirmed } : {}),
        ...(body.status === "RESOLVED" ? { resolvedAt: new Date() } : {}),
      },
    });
    return NextResponse.json({ request: updated });
  } catch (err) {
    console.error("Failed to update maintenance request:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
