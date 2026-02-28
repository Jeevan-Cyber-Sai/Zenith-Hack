import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/app/curriculum
 * Returns Mathematics Class 12 curriculum: chapters with sections (concepts) and question counts.
 */
export async function GET() {
  const subject = await prisma.subject.findUnique({
    where: { slug: "mathematics" },
    include: {
      classes: {
        where: { name: "12" },
        include: {
          chapters: {
            orderBy: { order: "asc" },
            include: {
              concepts: {
                include: {
                  _count: { select: { questions: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!subject || subject.classes.length === 0) {
    return NextResponse.json({
      subject: { id: null, name: "Mathematics", slug: "mathematics" },
      class: null,
      chapters: [],
    });
  }

  const cls = subject.classes[0];
  const chapters = cls.chapters.map((ch) => ({
    id: ch.id,
    title: ch.title,
    order: ch.order,
    sections: ch.concepts.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      questionCount: c._count.questions,
    })),
  }));

  return NextResponse.json({
    subject: { id: subject.id, name: subject.name, slug: subject.slug },
    class: { id: cls.id, name: cls.name },
    chapters,
  });
}
