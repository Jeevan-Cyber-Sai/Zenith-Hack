/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient, Difficulty } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@student.com" },
    update: {},
    create: {
      email: "demo@student.com",
      name: "Demo Student",
    },
  });

  // Mathematics Class 12
  const subject = await prisma.subject.upsert({
    where: { slug: "mathematics" },
    update: {},
    create: { slug: "mathematics", name: "Mathematics" },
  });

  const cls = await prisma.class.upsert({
    where: {
      subjectId_name: { subjectId: subject.id, name: "12" },
    },
    update: {},
    create: { subjectId: subject.id, name: "12" },
  });

  // Chapter 1: Relations and Functions
  let ch1Res = await prisma.chapter.findFirst({
    where: { classId: cls.id, order: 1 },
  });
  if (!ch1Res) {
    ch1Res = await prisma.chapter.create({
      data: { classId: cls.id, title: "Relations and Functions", order: 1 },
    });
  }

  const relAndFunc = await prisma.concept.upsert({
    where: { slug: "relations-and-functions" },
    update: { chapterId: ch1Res.id },
    create: {
      slug: "relations-and-functions",
      title: "Relations and Functions",
      description: "Types of relations and functions, composition, invertibility.",
      chapterId: ch1Res.id,
    },
  });

  const questionsCh1 = [
    { prompt: "Let A = {1, 2, 3}. Write the relation R = {(a, b) : a + b = 4} in roster form.", difficulty: Difficulty.EASY },
    { prompt: "Check whether the relation R in the set Z of integers given by R = {(a, b) : 2 divides (a - b)} is reflexive, symmetric, transitive.", difficulty: Difficulty.MEDIUM },
    { prompt: "Show that the relation R in the set A = {1, 2, 3, 4, 5} given by R = {(a, b) : |a - b| is even} is an equivalence relation.", difficulty: Difficulty.HARD },
    { prompt: "Let f : R → R be defined as f(x) = 10x + 7. Find the function g : R → R such that g ∘ f = f ∘ g = I_R.", difficulty: Difficulty.CHALLENGE },
  ];
  for (const q of questionsCh1) {
    const exists = await prisma.question.findFirst({
      where: { conceptId: relAndFunc.id, prompt: q.prompt },
    });
    if (!exists) await prisma.question.create({ data: { conceptId: relAndFunc.id, ...q } });
  }

  // Ensure at least one question per concept
  const existing = await prisma.question.count({ where: { conceptId: relAndFunc.id } });
  if (existing === 0) {
    await prisma.question.create({
      data: {
        conceptId: relAndFunc.id,
        prompt: "Let A = {1, 2, 3}. Write the relation R = {(a, b) : a + b = 4} in roster form.",
        difficulty: Difficulty.EASY,
      },
    });
  }

  // Chapter 2: Linear Equations (Algebra)
  const ch2 = await prisma.chapter.findFirst({ where: { classId: cls.id, order: 2 } })
    || await prisma.chapter.create({
      data: { classId: cls.id, title: "Linear Equations and Matrices", order: 2 },
    });

  const linearEq = await prisma.concept.upsert({
    where: { slug: "linear-equations" },
    update: { chapterId: ch2.id },
    create: {
      slug: "linear-equations",
      title: "Linear Equations",
      description: "Solve linear equations in one variable and word problems.",
      chapterId: ch2.id,
    },
  });

  const questionsLinear = [
    { prompt: "Solve for x: x + 3 = 7", difficulty: Difficulty.EASY },
    { prompt: "Solve for x: 2x - 5 = 9", difficulty: Difficulty.MEDIUM },
    { prompt: "Solve for x: 3(x - 2) = 15", difficulty: Difficulty.HARD },
    { prompt: "Solve for x: 4x + 7 = 3x - 5", difficulty: Difficulty.CHALLENGE },
  ];
  for (const q of questionsLinear) {
    const exists = await prisma.question.findFirst({
      where: { conceptId: linearEq.id, prompt: q.prompt },
    });
    if (!exists) await prisma.question.create({ data: { conceptId: linearEq.id, ...q } });
  }

  const systemsEq = await prisma.concept.upsert({
    where: { slug: "systems-of-equations" },
    update: { chapterId: ch2.id },
    create: {
      slug: "systems-of-equations",
      title: "Systems of Equations",
      description: "Solve systems of linear equations.",
      chapterId: ch2.id,
    },
  });

  const qSys = [
    { prompt: "Solve: x + y = 5, x - y = 1", difficulty: Difficulty.EASY },
    { prompt: "Solve: 2x + 3y = 12, 4x - y = 5", difficulty: Difficulty.MEDIUM },
  ];
  for (const q of qSys) {
    const exists = await prisma.question.findFirst({
      where: { conceptId: systemsEq.id, prompt: q.prompt },
    });
    if (!exists) await prisma.question.create({ data: { conceptId: systemsEq.id, ...q } });
  }

  // Prerequisite: linear equations → systems
  await prisma.conceptRelation.upsert({
    where: {
      fromConceptId_toConceptId: {
        fromConceptId: linearEq.id,
        toConceptId: systemsEq.id,
      },
    },
    update: {},
    create: {
      fromConceptId: linearEq.id,
      toConceptId: systemsEq.id,
    },
  });

  console.log("Seed done. Demo user id:", user.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
