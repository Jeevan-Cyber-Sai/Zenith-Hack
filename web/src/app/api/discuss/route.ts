import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const conceptId = req.nextUrl.searchParams.get("conceptId");

  const messages = await prisma.discussionMessage.findMany({
    where: conceptId ? { conceptId } : {},
    orderBy: { createdAt: "asc" },
    take: 100,
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  return NextResponse.json(
    messages.map((m) => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt,
      user: m.user,
      conceptId: m.conceptId,
    }))
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    userId,
    content,
    conceptId,
  }: { userId: string; content: string; conceptId?: string | null } = body;

  if (!userId || !content?.trim()) {
    return NextResponse.json(
      { error: "userId and non-empty content are required" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const message = await prisma.discussionMessage.create({
    data: {
      userId,
      content: content.trim(),
      conceptId: conceptId || null,
    },
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  return NextResponse.json(
    {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      user: message.user,
      conceptId: message.conceptId,
    },
    { status: 201 }
  );
}

