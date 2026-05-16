import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  feedback: z.enum(["interested", "not_interested", "need_more_info"]),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = bodySchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", issues: result.error.issues }, { status: 422 });
  }

  const { feedback, notes } = result.data;

  try {
    const viewing = await db.viewingBooking.findUnique({ where: { id } });

    if (!viewing) {
      return NextResponse.json({ error: "Viewing not found" }, { status: 404 });
    }

    if (viewing.tenantId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await db.viewingBooking.update({
      where: { id },
      data: {
        tenantFeedback: feedback,
        tenantNotes: notes,
        status: "COMPLETED",
      },
    });

    return NextResponse.json({ viewing: updated });
  } catch (err) {
    console.error("Failed to submit feedback:", err);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}
