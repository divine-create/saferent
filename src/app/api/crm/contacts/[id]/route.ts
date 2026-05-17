import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import type { LeadStatus } from "@prisma/client";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const contact = await db.cRMContact.findUnique({ where: { id } });
    if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (contact.agentId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ contact: { ...contact, budget: contact.budget?.toString() ?? null } });
  } catch (err) {
    console.error("Failed to fetch contact:", err);
    return NextResponse.json({ error: "Failed to fetch contact" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as {
    notes?: string;
    leadStatus?: LeadStatus;
    tags?: string[];
    followUpDate?: string | null;
    lastContactedAt?: string;
    budget?: string;
    phone?: string;
    email?: string;
    portfolioSize?: number;
    activeListings?: number;
  };

  try {
    const contact = await db.cRMContact.findUnique({ where: { id } });
    if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (contact.agentId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await db.cRMContact.update({
      where: { id },
      data: {
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
        ...(body.leadStatus ? { leadStatus: body.leadStatus } : {}),
        ...(body.tags ? { tags: body.tags } : {}),
        ...(body.followUpDate !== undefined
          ? { followUpDate: body.followUpDate ? new Date(body.followUpDate) : null }
          : {}),
        ...(body.lastContactedAt ? { lastContactedAt: new Date(body.lastContactedAt) } : {}),
        ...(body.budget ? { budget: BigInt(body.budget) } : {}),
        ...(body.phone !== undefined ? { phone: body.phone } : {}),
        ...(body.email !== undefined ? { email: body.email } : {}),
        ...(body.portfolioSize !== undefined ? { portfolioSize: body.portfolioSize } : {}),
        ...(body.activeListings !== undefined ? { activeListings: body.activeListings } : {}),
      },
    });
    return NextResponse.json({ contact: { ...updated, budget: updated.budget?.toString() ?? null } });
  } catch (err) {
    console.error("Failed to update contact:", err);
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const contact = await db.cRMContact.findUnique({ where: { id } });
    if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (contact.agentId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await db.cRMContact.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete contact:", err);
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 });
  }
}
