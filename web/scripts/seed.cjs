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
    { prompt: "Determine whether the relation R on N given by R = {(a, b) : a - b is a multiple of 3} is an equivalence relation.", difficulty: Difficulty.MEDIUM },
    { prompt: "On the set Z of integers, examine whether the relation R = {(a, b) : a · b ≥ 0} is reflexive, symmetric and transitive.", difficulty: Difficulty.MEDIUM },
    { prompt: "Let A = {1, 2, 3, 4}. Write all equivalence classes of the relation R defined by a R b if and only if a and b have the same parity.", difficulty: Difficulty.MEDIUM },
    { prompt: "Prove that the relation R on R given by a R b ⇔ a − b ∈ Z is an equivalence relation. Describe the equivalence class of 1/2.", difficulty: Difficulty.HARD },
    { prompt: "Let f : R → R be defined by f(x) = 2x + 3. Show that f is one-one and onto, and hence find f⁻¹.", difficulty: Difficulty.MEDIUM },
    { prompt: "Let f : R → R be defined by f(x) = x² + 1. Is f invertible on R? If not, restrict its domain suitably so that it becomes invertible and find its inverse on that domain.", difficulty: Difficulty.HARD },
    { prompt: "Given f : R → R, f(x) = x³, verify whether f is one-one and onto. What can you say about f⁻¹?", difficulty: Difficulty.EASY },
    { prompt: "Find the composition (g ∘ f)(x) and (f ∘ g)(x) where f(x) = x² and g(x) = x + 1. Are they equal?", difficulty: Difficulty.EASY },
    { prompt: "Let f : R → R be defined as f(x) = 3x − 4 and g : R → R be defined as g(x) = x/3 + 4/3. Show that g is the inverse of f.", difficulty: Difficulty.MEDIUM },
    { prompt: "If f : R → R is defined by f(x) = x³ and g : R → R is defined by g(x) = ∛x, verify that g ∘ f = f ∘ g = I_R.", difficulty: Difficulty.MEDIUM },
    { prompt: "Give an example of a relation on the set of students in your class that is symmetric but not transitive, and explain why.", difficulty: Difficulty.EASY },
    { prompt: "Give an example of a real-life function that is not one-one but is onto, and justify your answer.", difficulty: Difficulty.EASY },
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
    { prompt: "Solve for x: 7x - 9 = 5x + 3", difficulty: Difficulty.EASY },
    { prompt: "Solve for x: 2(2x + 5) - (x - 1) = 9", difficulty: Difficulty.MEDIUM },
    { prompt: "Solve for x: (3x - 4)/5 - (x + 1)/2 = 1", difficulty: Difficulty.MEDIUM },
    { prompt: "Solve for x: 4 - 3(2x - 1) = 2x + 5", difficulty: Difficulty.HARD },
    { prompt: "A number is such that 5 times the number increased by 7 is 32. Form the equation and find the number.", difficulty: Difficulty.EASY },
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
    { prompt: "Solve the system: x + 2y = 4, 3x - y = 5", difficulty: Difficulty.EASY },
    { prompt: "Solve the system: 2x - 3y = 7, 4x + y = 1", difficulty: Difficulty.MEDIUM },
    { prompt: "Solve the system: 3x + 4y = 10, 5x - 2y = 4", difficulty: Difficulty.MEDIUM },
    { prompt: "Solve: x + y + z = 6, x − y + z = 2, 2x + y − z = 3", difficulty: Difficulty.HARD },
    { prompt: "Solve, if possible: x + y = 2, 2x + 2y = 5. Comment on the nature of the system.", difficulty: Difficulty.MEDIUM },
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
    { prompt: "Find the principal value of sin⁻¹(−√3/2).", difficulty: Difficulty.EASY },
    { prompt: "Find the principal value of cos⁻¹(−1/2).", difficulty: Difficulty.EASY },
    { prompt: "Express sin⁻¹(x) − cos⁻¹(x) in terms of x.", difficulty: Difficulty.MEDIUM },
    { prompt: "Find the value of tan(sin⁻¹(3/5)).", difficulty: Difficulty.MEDIUM },
    { prompt: "Show that tan⁻¹ x + tan⁻¹(1/x) = π/2 for x > 0.", difficulty: Difficulty.MEDIUM },
    { prompt: "Prove that sin⁻¹ x + sin⁻¹ y = sin⁻¹(x√(1−y²) + y√(1−x²)) for suitable x and y.", difficulty: Difficulty.HARD },
    { prompt: "If tan⁻¹ a + tan⁻¹ b = π/4, show that a + b = 1 − ab.", difficulty: Difficulty.HARD },
    { prompt: "Simplify: 2 sin⁻¹ x = sin⁻¹(2x√(1−x²)).", difficulty: Difficulty.MEDIUM },
    { prompt: "Solve for x: cos⁻¹(2x² − 1) = 2 cos⁻¹ x.", difficulty: Difficulty.HARD },
    { prompt: "Solve the equation: tan⁻¹(2x) − tan⁻¹(1 − x) = π/4.", difficulty: Difficulty.CHALLENGE },
    { prompt: "If cos⁻¹ x + cos⁻¹ y = π/3, show that x² + y² + xy = 3/4.", difficulty: Difficulty.CHALLENGE },
    { prompt: "Graphically interpret the principal values of sin⁻¹ x and cos⁻¹ x on the same axes.", difficulty: Difficulty.EASY },
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
    { prompt: "Write the zero matrix and identity matrix of order 2. State their orders.", difficulty: Difficulty.EASY },
    { prompt: "If A = [2 −1; 0 3] and B = [1 4; 2 −2], find A + B and 2A − B.", difficulty: Difficulty.EASY },
    { prompt: "For matrices A (of order m×n) and B (of order n×p), what is the order of AB? Give an example.", difficulty: Difficulty.MEDIUM },
    { prompt: "If A = [1 2; 0 1], show that Aⁿ = [1 2n; 0 1] for any positive integer n.", difficulty: Difficulty.HARD },
    { prompt: "Verify that (AB)' = B'A' for suitable 2×2 matrices A and B of your choice.", difficulty: Difficulty.MEDIUM },
    { prompt: "If A = [1 2 3; 0 1 4; 0 0 1], find |A| and comment on the type of matrix A.", difficulty: Difficulty.MEDIUM },
    { prompt: "Show that the determinant of a triangular matrix is the product of its diagonal elements using an example.", difficulty: Difficulty.MEDIUM },
    { prompt: "Solve the system: x + y + z = 6, 2x − y + 3z = 14, 3x + 4y − 2z = 2 using matrices.", difficulty: Difficulty.HARD },
    { prompt: "If A is a 2×2 matrix such that A² = O (zero matrix) but A ≠ O, give an example and verify.", difficulty: Difficulty.HARD },
    { prompt: "Show by an example that matrix multiplication is not commutative, i.e. AB ≠ BA in general.", difficulty: Difficulty.EASY },
    { prompt: "If A = [a b; c d] with ad − bc ≠ 0, write the formula for A⁻¹ and verify it for A = [1 2; 3 5].", difficulty: Difficulty.MEDIUM },
    { prompt: "Explain geometrically what multiplying a vector by a rotation matrix A = [cos θ −sin θ; sin θ cos θ] does in the plane.", difficulty: Difficulty.EASY },
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
    { prompt: "Check the continuity of f(x) = { x², x ≠ 1; 3, x = 1 } at x = 1.", difficulty: Difficulty.EASY },
    { prompt: "Using first principles, find the derivative of f(x) = x².", difficulty: Difficulty.MEDIUM },
    { prompt: "If f(x) = |x − 3|, discuss its differentiability at x = 3.", difficulty: Difficulty.MEDIUM },
    { prompt: "If y = e^x cos x, find dy/dx and d²y/dx².", difficulty: Difficulty.MEDIUM },
    { prompt: "If y = log(x² + 1), find dy/dx.", difficulty: Difficulty.EASY },
    { prompt: "Verify Rolle's Theorem for f(x) = x² − 4x + 3 on [1, 3].", difficulty: Difficulty.HARD },
    { prompt: "If y = tan⁻¹(√(1−x²)/x), find dy/dx.", difficulty: Difficulty.HARD },
    { prompt: "If y = sin⁻¹(2x/ (1 + x²)), show that dy/dx = 2/(1 + x²).", difficulty: Difficulty.CHALLENGE },
    { prompt: "Find the derivative of f(x) = x^x for x > 0.", difficulty: Difficulty.CHALLENGE },
    { prompt: "If f and g are differentiable functions, write the product rule for (fg)' and illustrate it with an example.", difficulty: Difficulty.EASY },
    { prompt: "State and prove the chain rule for composite functions with a simple example.", difficulty: Difficulty.MEDIUM },
    { prompt: "Discuss the continuity and differentiability of f(x) = { x², x ≤ 1; 2x − 1, x > 1 } at x = 1.", difficulty: Difficulty.HARD },
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
