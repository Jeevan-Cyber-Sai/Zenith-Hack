/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient, Difficulty } = require("@prisma/client");

const prisma = new PrismaClient();

async function ensureQuestions(conceptId, questions) {
  for (const q of questions) {
    const exists = await prisma.question.findFirst({
      where: { conceptId, prompt: q.prompt },
    });
    if (!exists) await prisma.question.create({ data: { conceptId, ...q } });
  }
}

async function getOrCreateChapter(clsId, order, title) {
  let ch = await prisma.chapter.findFirst({
    where: { classId: clsId, order },
  });
  if (!ch) {
    ch = await prisma.chapter.create({
      data: { classId: clsId, title, order },
    });
  }
  return ch;
}

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@student.com" },
    update: {},
    create: {
      email: "demo@student.com",
      name: "Demo Student",
    },
  });

  const subject = await prisma.subject.upsert({
    where: { slug: "mathematics" },
    update: {},
    create: { slug: "mathematics", name: "Mathematics" },
  });

  const cls = await prisma.class.upsert({
    where: { subjectId_name: { subjectId: subject.id, name: "12" } },
    update: {},
    create: { subjectId: subject.id, name: "12" },
  });

  // ——— Chapter 1: Relations and Functions ———
  const ch1 = await getOrCreateChapter(cls.id, 1, "Relations and Functions");
  const relAndFunc = await prisma.concept.upsert({
    where: { slug: "relations-and-functions" },
    update: { chapterId: ch1.id },
    create: {
      slug: "relations-and-functions",
      title: "Relations and Functions",
      description: "Types of relations and functions, composition, invertibility.",
      chapterId: ch1.id,
    },
  });
  await ensureQuestions(relAndFunc.id, [
    { prompt: "Let A = {1, 2, 3}. Write the relation R = {(a, b) : a + b = 4} in roster form.", difficulty: Difficulty.EASY },
    { prompt: "Let A = {1, 2, 3, 4}. Write R = {(a, b) : a divides b} in roster form.", difficulty: Difficulty.EASY },
    { prompt: "Check whether the relation R in Z given by R = {(a, b) : 2 divides (a - b)} is reflexive, symmetric, transitive.", difficulty: Difficulty.MEDIUM },
    { prompt: "Check whether R = {(a, b) : a ≤ b} on the set N of natural numbers is reflexive, symmetric, transitive.", difficulty: Difficulty.MEDIUM },
    { prompt: "Show that R in A = {1, 2, 3, 4, 5} given by R = {(a, b) : |a - b| is even} is an equivalence relation.", difficulty: Difficulty.HARD },
    { prompt: "Show that the relation R in the set A = {1, 2, 3, 4, 5, 6} given by R = {(a, b) : b = a + 1} is neither reflexive nor symmetric.", difficulty: Difficulty.HARD },
    { prompt: "Let f : R → R be defined as f(x) = 10x + 7. Find g : R → R such that g ∘ f = f ∘ g = I_R.", difficulty: Difficulty.CHALLENGE },
    { prompt: "Let f : N → N be defined by f(n) = n + 1. Is f onto? Is f one-one?", difficulty: Difficulty.CHALLENGE },
  ]);

  // ——— Chapter 2: Linear Equations and Matrices ———
  const ch2 = await getOrCreateChapter(cls.id, 2, "Linear Equations and Matrices");
  const linearEq = await prisma.concept.upsert({
    where: { slug: "linear-equations" },
    update: { chapterId: ch2.id },
    create: {
      slug: "linear-equations",
      title: "Linear Equations",
      description: "Solve linear equations in one variable.",
      chapterId: ch2.id,
    },
  });
  await ensureQuestions(linearEq.id, [
    { prompt: "Solve for x: x + 3 = 7", difficulty: Difficulty.EASY },
    { prompt: "Solve for x: 5x = 20", difficulty: Difficulty.EASY },
    { prompt: "Solve for x: 2x - 5 = 9", difficulty: Difficulty.MEDIUM },
    { prompt: "Solve for x: 3x + 4 = 2x + 10", difficulty: Difficulty.MEDIUM },
    { prompt: "Solve for x: 3(x - 2) = 15", difficulty: Difficulty.HARD },
    { prompt: "Solve for x: (x + 1)/2 = (x - 3)/4", difficulty: Difficulty.HARD },
    { prompt: "Solve for x: 4x + 7 = 3x - 5", difficulty: Difficulty.CHALLENGE },
    { prompt: "Solve for x: 2(3x - 1) - 3(2x + 1) = 5", difficulty: Difficulty.CHALLENGE },
  ]);

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
  await ensureQuestions(systemsEq.id, [
    { prompt: "Solve: x + y = 5, x - y = 1", difficulty: Difficulty.EASY },
    { prompt: "Solve: 2x + y = 7, x - y = 2", difficulty: Difficulty.EASY },
    { prompt: "Solve: 2x + 3y = 12, 4x - y = 5", difficulty: Difficulty.MEDIUM },
    { prompt: "Solve: 3x + 2y = 8, 2x + 3y = 7", difficulty: Difficulty.MEDIUM },
    { prompt: "Solve: x/2 + y/3 = 2, 2x - y = 5", difficulty: Difficulty.HARD },
    { prompt: "Solve: 2x + 3y = 13, 5x - 4y = -2", difficulty: Difficulty.HARD },
    { prompt: "Solve: (x+y)/2 + (x-y)/3 = 4, (x+y)/3 + (x-y)/2 = 1", difficulty: Difficulty.CHALLENGE },
  ]);

  try {
    await prisma.conceptRelation.upsert({
      where: { fromConceptId_toConceptId: { fromConceptId: linearEq.id, toConceptId: systemsEq.id } },
      update: {},
      create: { fromConceptId: linearEq.id, toConceptId: systemsEq.id },
    });
  } catch (_) {}

  // ——— Chapter 3: Inverse Trigonometric Functions ———
  const ch3 = await getOrCreateChapter(cls.id, 3, "Inverse Trigonometric Functions");
  const invTrig = await prisma.concept.upsert({
    where: { slug: "inverse-trigonometric-functions" },
    update: { chapterId: ch3.id },
    create: {
      slug: "inverse-trigonometric-functions",
      title: "Inverse Trigonometric Functions",
      description: "Principal values and properties of inverse trig functions.",
      chapterId: ch3.id,
    },
  });
  await ensureQuestions(invTrig.id, [
    { prompt: "Find the principal value of sin⁻¹(1/2).", difficulty: Difficulty.EASY },
    { prompt: "Find the principal value of cos⁻¹(√3/2).", difficulty: Difficulty.EASY },
    { prompt: "Find the principal value of tan⁻¹(1).", difficulty: Difficulty.MEDIUM },
    { prompt: "Simplify: sin⁻¹(x) + cos⁻¹(x) for x in [-1, 1].", difficulty: Difficulty.MEDIUM },
    { prompt: "Prove: tan⁻¹(1/2) + tan⁻¹(1/3) = π/4.", difficulty: Difficulty.HARD },
    { prompt: "Find the value of cos(sin⁻¹(3/5) + cos⁻¹(12/13)).", difficulty: Difficulty.HARD },
    { prompt: "Solve: 2 tan⁻¹(cos x) = tan⁻¹(2 cosec x).", difficulty: Difficulty.CHALLENGE },
    { prompt: "Prove: tan⁻¹(1/4) + tan⁻¹(2/9) = (1/2) cos⁻¹(3/5).", difficulty: Difficulty.CHALLENGE },
  ]);

  // ——— Chapter 4: Matrices ———
  const ch4 = await getOrCreateChapter(cls.id, 4, "Matrices");
  const matrices = await prisma.concept.upsert({
    where: { slug: "matrices" },
    update: { chapterId: ch4.id },
    create: {
      slug: "matrices",
      title: "Matrices",
      description: "Operations on matrices, transpose, symmetric and skew-symmetric.",
      chapterId: ch4.id,
    },
  });
  await ensureQuestions(matrices.id, [
    { prompt: "If A = [1 2; 3 4], find A + A'.", difficulty: Difficulty.EASY },
    { prompt: "Find the order of the matrix A if A has 3 rows and 4 columns.", difficulty: Difficulty.EASY },
    { prompt: "If A is a 3×3 matrix such that |A| = 2, find |3A|.", difficulty: Difficulty.MEDIUM },
    { prompt: "Show that the matrix A = [1 2; 2 1] satisfies A² - 2A - 3I = 0.", difficulty: Difficulty.MEDIUM },
    { prompt: "Find the inverse of A = [2 3; 5 7] if it exists.", difficulty: Difficulty.HARD },
    { prompt: "If A and B are symmetric matrices of the same order, show that AB is symmetric iff AB = BA.", difficulty: Difficulty.HARD },
    { prompt: "If A = [cos θ -sin θ; sin θ cos θ], verify that A'A = I and find A⁻¹.", difficulty: Difficulty.CHALLENGE },
    { prompt: "Express the matrix A = [3 2; 4 1] as the sum of a symmetric and a skew-symmetric matrix.", difficulty: Difficulty.CHALLENGE },
  ]);

  // ——— Chapter 5: Continuity and Differentiability ———
  const ch5 = await getOrCreateChapter(cls.id, 5, "Continuity and Differentiability");
  const contDiff = await prisma.concept.upsert({
    where: { slug: "continuity-and-differentiability" },
    update: { chapterId: ch5.id },
    create: {
      slug: "continuity-and-differentiability",
      title: "Continuity and Differentiability",
      description: "Continuity, differentiability, chain rule, derivatives of inverse functions.",
      chapterId: ch5.id,
    },
  });
  await ensureQuestions(contDiff.id, [
    { prompt: "Examine the continuity of f(x) = x² at x = 2.", difficulty: Difficulty.EASY },
    { prompt: "Find the derivative of f(x) = x³ + 2x + 1 with respect to x.", difficulty: Difficulty.EASY },
    { prompt: "If y = sin(x²), find dy/dx.", difficulty: Difficulty.MEDIUM },
    { prompt: "Discuss the continuity of f(x) = |x| at x = 0.", difficulty: Difficulty.MEDIUM },
    { prompt: "If y = (sin x)^(cos x), find dy/dx.", difficulty: Difficulty.HARD },
    { prompt: "If x = a(θ - sin θ), y = a(1 - cos θ), find d²y/dx².", difficulty: Difficulty.HARD },
    { prompt: "If y = tan⁻¹((√(1+x²)-1)/x), find dy/dx.", difficulty: Difficulty.CHALLENGE },
    { prompt: "If y = e^(ax) sin(bx), prove that d²y/dx² - 2a(dy/dx) + (a²+b²)y = 0.", difficulty: Difficulty.CHALLENGE },
  ]);

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
