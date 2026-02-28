import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    email,
    password,
    name,
    phone,
    school,
  } = body as {
    email: string;
    password: string;
    name?: string;
    phone?: string;
    school?: string;
  };

  if (!email?.trim()) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }
  if (!password || password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
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

  const hashedPassword = await hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      name: (name ?? "").trim() || null,
      password: hashedPassword,
      phone: (phone ?? "").trim() || null,
      school: (school ?? "").trim() || null,
    },
  });

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    school: user.school,
    xp: user.xp ?? 0,
  });
}
