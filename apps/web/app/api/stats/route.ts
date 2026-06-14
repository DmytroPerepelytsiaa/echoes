import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { decisions } from "@/db/schema";
import { getUserId } from "@/lib/session";
import { unauthorized } from "@/lib/api";
import type { DecisionStatus } from "@/lib/validations";

export const dynamic = "force-dynamic";

/** GET /api/stats — aggregated metrics for the dashboard. */
export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const rows = await db
    .select({
      status: decisions.status,
      category: decisions.category,
      complexity: decisions.complexity,
      biasTypes: decisions.biasTypes,
      analysis: decisions.analysis,
      createdAt: decisions.createdAt,
    })
    .from(decisions)
    .where(eq(decisions.userId, userId))
    .orderBy(desc(decisions.createdAt));

  const byStatus: Record<DecisionStatus, number> = {
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  };
  const categoryCounts = new Map<string, number>();
  const biasCounts = new Map<string, number>();
  const perDay = new Map<string, number>();

  let complexitySum = 0;
  let complexityN = 0;
  let qualitySum = 0;
  let qualityN = 0;

  for (const row of rows) {
    byStatus[row.status] += 1;

    const day = row.createdAt.toISOString().slice(0, 10);
    perDay.set(day, (perDay.get(day) ?? 0) + 1);

    if (row.category) {
      categoryCounts.set(
        row.category,
        (categoryCounts.get(row.category) ?? 0) + 1,
      );
    }
    for (const bias of row.biasTypes ?? []) {
      biasCounts.set(bias, (biasCounts.get(bias) ?? 0) + 1);
    }
    if (typeof row.complexity === "number") {
      complexitySum += row.complexity;
      complexityN += 1;
    }
    if (row.analysis && typeof row.analysis.quality === "number") {
      qualitySum += row.analysis.quality;
      qualityN += 1;
    }
  }

  const toSortedArray = (map: Map<string, number>) =>
    Array.from(map.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);

  // Last 14 days timeline (zero-filled).
  const timeline: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    timeline.push({ date: key, count: perDay.get(key) ?? 0 });
  }

  return NextResponse.json({
    total: rows.length,
    byStatus,
    completed: byStatus.completed,
    byCategory: toSortedArray(categoryCounts),
    byBias: toSortedArray(biasCounts),
    avgComplexity: complexityN ? complexitySum / complexityN : null,
    avgQuality: qualityN ? qualitySum / qualityN : null,
    timeline,
  });
}
