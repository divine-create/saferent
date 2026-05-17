import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { mockMaintenanceRequests } from "@/lib/mock-property";
import type { MaintenanceCategory } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tenancyId = searchParams.get("tenancyId");

  try {
    const where =
      session.user.role === "LANDLORD"
        ? { landlordId: session.user.id, ...(tenancyId ? { tenancyId } : {}) }
        : { tenantId: session.user.id, ...(tenancyId ? { tenancyId } : {}) };

    const requests = await db.maintenanceRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ requests });
  } catch {
    return NextResponse.json({ requests: mockMaintenanceRequests });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "TENANT") {
    return NextResponse.json({ error: "Only tenants can submit maintenance requests" }, { status: 403 });
  }

  const body = await req.json() as {
    tenancyId: string;
    landlordId: string;
    category: MaintenanceCategory;
    title: string;
    description: string;
    urgency?: string;
    photoUrls?: string[];
  };
  const { tenancyId, landlordId, category, title, description, urgency = "normal", photoUrls = [] } = body;

  if (!tenancyId || !landlordId || !category || !title || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const request = await db.maintenanceRequest.create({
      data: {
        tenancyId,
        tenantId: session.user.id,
        landlordId,
        category,
        title,
        description,
        urgency,
        photoUrls,
      },
    });
    return NextResponse.json({ request }, { status: 201 });
  } catch (err) {
    console.error("Failed to create maintenance request:", err);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}
