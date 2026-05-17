import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { mockCRMContacts } from "@/lib/mock-crm";
import type { CRMContactType, LeadStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "AGENT") {
    return NextResponse.json({ error: "Only agents can access CRM" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as CRMContactType | null;
  const leadStatus = searchParams.get("leadStatus") as LeadStatus | null;

  try {
    const contacts = await db.cRMContact.findMany({
      where: {
        agentId: session.user.id,
        ...(type ? { type } : {}),
        ...(leadStatus ? { leadStatus } : {}),
      },
      orderBy: { updatedAt: "desc" },
    });
    const serialized = contacts.map((c) => ({
      ...c,
      budget: c.budget?.toString() ?? null,
    }));
    return NextResponse.json({ contacts: serialized });
  } catch {
    let filtered = mockCRMContacts;
    if (type) filtered = filtered.filter((c) => c.type === type);
    if (leadStatus) filtered = filtered.filter((c) => c.leadStatus === leadStatus);
    return NextResponse.json({ contacts: filtered });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "AGENT") {
    return NextResponse.json({ error: "Only agents can create CRM contacts" }, { status: 403 });
  }

  const body = await req.json() as {
    type: CRMContactType;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    notes?: string;
    tags?: string[];
    leadStatus?: LeadStatus;
    budget?: string;
    preferredAreas?: string[];
    portfolioSize?: number;
    activeListings?: number;
    followUpDate?: string;
  };

  const { type, firstName, lastName } = body;
  if (!type || !firstName || !lastName) {
    return NextResponse.json({ error: "type, firstName, lastName required" }, { status: 400 });
  }

  try {
    const contact = await db.cRMContact.create({
      data: {
        agentId: session.user.id,
        type,
        firstName,
        lastName,
        email: body.email ?? null,
        phone: body.phone ?? null,
        notes: body.notes ?? null,
        tags: body.tags ?? [],
        leadStatus: body.leadStatus ?? (type === "TENANT_LEAD" ? "NEW" : null),
        budget: body.budget ? BigInt(body.budget) : null,
        preferredAreas: body.preferredAreas ?? [],
        portfolioSize: body.portfolioSize ?? null,
        activeListings: body.activeListings ?? null,
        followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
      },
    });
    return NextResponse.json(
      { contact: { ...contact, budget: contact.budget?.toString() ?? null } },
      { status: 201 }
    );
  } catch (err) {
    console.error("Failed to create CRM contact:", err);
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}
