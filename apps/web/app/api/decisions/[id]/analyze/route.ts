import { NextResponse, after, type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { decisions } from "@/db/schema";
import { getUserId } from "@/lib/session";
import { jsonError, unauthorized } from "@/lib/api";
import { runAnalysis } from "@/lib/analysis";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/decisions/:id/analyze — (re)run the analysis. Used both for the
 * "re-analyze" action and for retrying a failed analysis. Sets the row back to
 * `pending` immediately and runs the LLM in the background.
 */
export async function POST(_request: NextRequest, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const { id } = await params;

  const [row] = await db
    .select({ id: decisions.id })
    .from(decisions)
    .where(and(eq(decisions.id, id), eq(decisions.userId, userId)))
    .limit(1);

  if (!row) return jsonError("Decision not found.", 404);

  const [updated] = await db
    .update(decisions)
    .set({ status: "pending", error: null })
    .where(eq(decisions.id, id))
    .returning();

  after(async () => {
    await runAnalysis(id);
  });

  return NextResponse.json({ decision: updated });
}
