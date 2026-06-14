"use client";

import Link from "next/link";
import { Brain, CheckCircle2, Gauge, LayoutGrid, Plus } from "lucide-react";
import { useStats } from "@/lib/decisions-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import {
  ActivityTimeline,
  HorizontalBars,
  StatCard,
} from "./charts";

export function DashboardView() {
  const { data: stats, isLoading, isError, error, refetch } = useStats();

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load your dashboard"
        description={error instanceof Error ? error.message : undefined}
        onRetry={() => refetch()}
      />
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <EmptyState
        icon={<LayoutGrid className="size-6" />}
        title="Your dashboard is empty"
        description="Record a few decisions and insights will start to appear here — categories, biases and trends."
        action={
          <Button asChild>
            <Link href="/decisions/new">
              <Plus className="size-4" />
              Record your first decision
            </Link>
          </Button>
        }
      />
    );
  }

  const fmt = (n: number | null) => (n === null ? "—" : n.toFixed(1));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Decisions"
          value={stats.total}
          hint={`${stats.completed} analysed`}
          icon={<LayoutGrid className="size-5" />}
        />
        <StatCard
          label="Avg quality"
          value={fmt(stats.avgQuality)}
          hint="out of 10"
          icon={<CheckCircle2 className="size-5" />}
        />
        <StatCard
          label="Avg complexity"
          value={fmt(stats.avgComplexity)}
          hint="out of 10"
          icon={<Gauge className="size-5" />}
        />
        <StatCard
          label="Distinct biases"
          value={stats.byBias.length}
          hint="across all decisions"
          icon={<Brain className="size-5" />}
        />
      </div>

      <ActivityTimeline data={stats.timeline} />

      <div className="grid gap-4 lg:grid-cols-2">
        <HorizontalBars
          title="Decisions by category"
          data={stats.byCategory}
          tone="primary"
        />
        <HorizontalBars
          title="Most frequent biases"
          data={stats.byBias}
          tone="accent"
          emptyLabel="No biases detected yet."
        />
      </div>

      {stats.byStatus.pending + stats.byStatus.processing > 0 ? (
        <Card>
          <CardContent className="flex items-center gap-3 py-4 text-sm text-muted">
            <span className="size-2 animate-pulse rounded-full bg-info" />
            {stats.byStatus.pending + stats.byStatus.processing} decision(s)
            still being analysed.
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-48 rounded-2xl" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}
