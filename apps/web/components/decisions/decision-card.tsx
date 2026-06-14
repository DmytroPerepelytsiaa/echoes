import Link from "next/link";
import { ArrowUpRight, Brain, Gauge } from "lucide-react";
import type { DecisionDTO } from "@/lib/decisions-client";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { timeAgo } from "@/lib/utils";

export function DecisionCard({ decision }: { decision: DecisionDTO }) {
  const biases = decision.biasTypes ?? [];

  return (
    <Link
      href={`/decisions/${decision.id}`}
      className="group block rounded-2xl border border-border bg-surface/70 p-5 transition-all hover:border-border-strong hover:bg-surface"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={decision.status} />
          {decision.category ? (
            <Badge variant="primary">{decision.category}</Badge>
          ) : null}
        </div>
        <ArrowUpRight className="size-4 shrink-0 text-faint transition-colors group-hover:text-foreground" />
      </div>

      <p className="mt-3 line-clamp-2 text-sm font-medium text-foreground">
        {decision.decision}
      </p>
      <p className="mt-1 line-clamp-2 text-sm text-muted">
        {decision.situation}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-faint">
        <span>{timeAgo(decision.createdAt)}</span>
        {typeof decision.complexity === "number" ? (
          <span className="inline-flex items-center gap-1.5">
            <Gauge className="size-3.5" />
            Complexity {decision.complexity}/10
          </span>
        ) : null}
        {biases.length > 0 ? (
          <span className="inline-flex items-center gap-1.5">
            <Brain className="size-3.5" />
            {biases.length} bias{biases.length > 1 ? "es" : ""}
          </span>
        ) : null}
      </div>

      {biases.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {biases.slice(0, 3).map((bias) => (
            <Badge key={bias} variant="accent">
              {bias}
            </Badge>
          ))}
          {biases.length > 3 ? (
            <Badge variant="outline">+{biases.length - 3}</Badge>
          ) : null}
        </div>
      ) : null}
    </Link>
  );
}
