import { NextResponse, type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { decisions } from "@/db/schema";
import { getUserId } from "@/lib/session";
import { jsonError, unauthorized } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** GET /api/decisions/:id — fetch one decision owned by the current user. */
export async function GET(_request: NextRequest, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const { id } = await params;
  const [row] = await db
    .select()
    .from(decisions)
    .where(and(eq(decisions.id, id), eq(decisions.userId, userId)))
    .limit(1);

  if (!row) return jsonError("Decision not found.", 404);
  return NextResponse.json({ decision: row });
}

/** DELETE /api/decisions/:id — remove a decision. */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const { id } = await params;
  const deleted = await db
    .delete(decisions)
    .where(and(eq(decisions.id, id), eq(decisions.userId, userId)))
    .returning({ id: decisions.id });

  if (deleted.length === 0) return jsonError("Decision not found.", 404);
  return NextResponse.json({ success: true });
}
