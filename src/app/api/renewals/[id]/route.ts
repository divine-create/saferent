import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as {
    // Tenant actions
    action?: "accept" | "decline" | "counter";
    tenantCounter?: string;
    tenantResponse?: string;
    // Landlord actions
    landlordResponse?: string;
    status?: string;
    noticeToVacateAt?: string;
  };

  try {
    const renewal = await db.leaseRenewal.findUnique({ where: { id } });
    if (!renewal) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let updateData: Record<string, unknown> = {};

    if (session.user.role === "TENANT") {
      if (renewal.tenantId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (body.action === "accept") {
        updateData = { status: "accepted" };
      } else if (body.action === "decline") {
        updateData = { status: "declined", tenantResponse: body.tenantResponse ?? null };
      } else if (body.action === "counter") {
        if (!body.tenantCounter) {
          return NextResponse.json({ error: "Counter offer amount required" }, { status: 400 });
        }
        updateData = {
          status: "negotiating",
          tenantCounter: BigInt(body.tenantCounter),
          tenantResponse: body.tenantResponse ?? null,
        };
      }
    } else if (session.user.role === "LANDLORD") {
      if (renewal.landlordId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      updateData = {
        ...(body.landlordResponse ? { landlordResponse: body.landlordResponse } : {}),
        ...(body.status ? { status: body.status } : {}),
        ...(body.noticeToVacateAt ? { noticeToVacateAt: new Date(body.noticeToVacateAt) } : {}),
      };
    }

    const updated = await db.leaseRenewal.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      renewal: {
        ...updated,
        proposedRent: updated.proposedRent.toString(),
        currentRent: updated.currentRent.toString(),
        tenantCounter: updated.tenantCounter?.toString() ?? null,
      },
    });
  } catch (err) {
    console.error("Failed to update renewal:", err);
    return NextResponse.json({ error: "Failed to update renewal" }, { status: 500 });
  }
}
