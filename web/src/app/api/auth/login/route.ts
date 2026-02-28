import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password } = body as { email: string; password: string };

  if (!email?.trim()) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user) {
    return NextResponse.json(
      { error: "No account found with this email. Please register." },
      { status: 404 }
    );
  }

  // Require password only for users who have one set (new registrations)
  if (user.password) {
    if (!password) {
      return NextResponse.json(
        { error: "Password is required." },
        { status: 400 }
      );
    }
    const ok = await compare(password, user.password);
    if (!ok) {
      return NextResponse.json(
        { error: "Incorrect password." },
        { status: 401 }
      );
    }
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    school: user.school,
    xp: user.xp ?? 0,
  });
}
