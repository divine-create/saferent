import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { mockAdminUsers } from "@/lib/mock-admin";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const role = searchParams.get("role") ?? "ALL";
  const status = searchParams.get("status") ?? "ALL";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 25;

  try {
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    if (role !== "ALL") {
      where.role = role;
    }

    if (status === "ACTIVE") {
      where.isActive = true;
      where.isBanned = false;
    } else if (status === "SUSPENDED") {
      where.isActive = false;
      where.isBanned = false;
    } else if (status === "BANNED") {
      where.isBanned = true;
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          bvnVerificationStatus: true,
          trustScore: true,
          isActive: true,
          isBanned: true,
          createdAt: true,
        },
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({ users, total, page, limit });
  } catch {
    // Fallback to mock data
    let filtered = mockAdminUsers;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.includes(search)
      );
    }

    if (role !== "ALL") {
      filtered = filtered.filter((u) => u.role === role);
    }

    if (status === "ACTIVE") {
      filtered = filtered.filter((u) => u.isActive && !u.isBanned);
    } else if (status === "SUSPENDED") {
      filtered = filtered.filter((u) => !u.isActive && !u.isBanned);
    } else if (status === "BANNED") {
      filtered = filtered.filter((u) => u.isBanned);
    }

    const total = filtered.length;
    const users = filtered.slice((page - 1) * limit, page * limit);

    return NextResponse.json({ users, total, page, limit });
  }
}
