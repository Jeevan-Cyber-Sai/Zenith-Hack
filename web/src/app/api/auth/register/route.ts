import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, name } = body as { email: string; name?: string };

  if (!email?.trim()) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists. Please log in." },
      { status: 409 }
    );
  }

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      name: (name ?? "").trim() || null,
    },
  });

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
  });
}
