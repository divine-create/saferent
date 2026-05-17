import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as {
    preferredCurrency?: string;
    isDiaspora?: boolean;
    countryOfResidence?: string;
  };

  const { preferredCurrency, isDiaspora, countryOfResidence } = body;

  const updateData: Record<string, unknown> = {};
  if (preferredCurrency !== undefined) updateData.preferredCurrency = preferredCurrency;
  if (isDiaspora !== undefined) updateData.isDiaspora = isDiaspora;
  if (countryOfResidence !== undefined) updateData.countryOfResidence = countryOfResidence;

  const user = await db.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: {
      id: true,
      preferredCurrency: true,
      isDiaspora: true,
      countryOfResidence: true,
    },
  });

  return NextResponse.json({ user });
}
