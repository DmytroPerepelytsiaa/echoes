import { NextResponse, after, type NextRequest } from "next/server";
import { and, arrayContains, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { decisions } from "@/db/schema";
import { getUserId } from "@/lib/session";
import { jsonError, unauthorized } from "@/lib/api";
import { decisionInputSchema, listQuerySchema } from "@/lib/validations";
import { runAnalysis } from "@/lib/analysis";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const parsed = listQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return jsonError("Invalid query parameters.", 400, parsed.error.issues);
  }
  const { category, bias, status, sort, order } = parsed.data;

  const conditions = [eq(decisions.userId, userId)];
  if (category) conditions.push(eq(decisions.category, category));
  if (status) conditions.push(eq(decisions.status, status));
  if (bias) conditions.push(arrayContains(decisions.biasTypes, [bias]));

  const sortColumn =
    sort === "complexity" ? decisions.complexity : decisions.createdAt;
  const direction = order === "asc" ? asc : desc;

  const rows = await db
    .select()
    .from(decisions)
    .where(and(...conditions))
    // Secondary sort keeps order stable when complexity is null/equal.
    .orderBy(direction(sortColumn), desc(decisions.createdAt));

  return NextResponse.json({ decisions: rows });
}

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const parsed = decisionInputSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed.", 422, parsed.error.issues);
  }

  const { situation, decision, reasoning } = parsed.data;

  const [created] = await db
    .insert(decisions)
    .values({
      userId,
      situation,
      decision,
      reasoning: reasoning?.trim() ? reasoning.trim() : null,
      status: "pending",
    })
    .returning();

  if (!created) return jsonError("Failed to create decision.", 500);

  // Analyse after the response is sent so the client gets an instant record.
  after(async () => {
    await runAnalysis(created.id);
  });

  return NextResponse.json({ decision: created }, { status: 201 });
}
