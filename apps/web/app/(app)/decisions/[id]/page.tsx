import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { decisions } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { DecisionDetail } from "@/components/decisions/decision-detail";
import type { DecisionDTO } from "@/lib/decisions-client";

export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function DecisionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const [row] = await db
    .select()
    .from(decisions)
    .where(and(eq(decisions.id, id), eq(decisions.userId, user.id)))
    .limit(1);

  if (!row) notFound();

  const initialData: DecisionDTO = {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };

  return <DecisionDetail id={id} initialData={initialData} />;
}
