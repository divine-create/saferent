import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { serializePrisma } from "@/lib/serialize";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const tab = searchParams.get("tab") ?? "queue";
  const search = searchParams.get("search") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 25;

  try {
    const where: Record<string, unknown> = {};

    if (tab === "queue") {
      where.status = "PENDING_VERIFICATION";
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    const [listings, total] = await Promise.all([
      db.listing.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          owner: { select: { firstName: true, lastName: true, role: true } },
          photos: { take: 1, orderBy: { order: "asc" } },
        },
      }),
      db.listing.count({ where }),
    ]);

    return NextResponse.json({ listings: serializePrisma(listings), total, page });
  } catch (err) {
    console.error("Failed to fetch admin listings:", err);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}
