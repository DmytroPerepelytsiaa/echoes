"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ListChecks, Plus, SlidersHorizontal } from "lucide-react";
import {
  DECISION_CATEGORIES,
  COGNITIVE_BIASES,
} from "@/lib/taxonomy";
import {
  DECISION_STATUSES,
  type ListQuery,
} from "@/lib/validations";
import { useDecisions, type DecisionDTO } from "@/lib/decisions-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { DecisionCard } from "./decision-card";

type SortOption = `${ListQuery["sort"]}:${ListQuery["order"]}`;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "complexity:desc", label: "Most complex" },
  { value: "complexity:asc", label: "Least complex" },
];

const ALL = "all";

export function DecisionsBrowser({
  initialData,
}: {
  initialData?: DecisionDTO[];
}) {
  const [category, setCategory] = useState<string>(ALL);
  const [bias, setBias] = useState<string>(ALL);
  const [status, setStatus] = useState<string>(ALL);
  const [sort, setSort] = useState<SortOption>("createdAt:desc");

  const [sortField, sortOrder] = sort.split(":") as [
    ListQuery["sort"],
    ListQuery["order"],
  ];

  const query: Partial<ListQuery> = useMemo(
    () => ({
      category: category === ALL ? undefined : (category as ListQuery["category"]),
      bias: bias === ALL ? undefined : (bias as ListQuery["bias"]),
      status: status === ALL ? undefined : (status as ListQuery["status"]),
      sort: sortField,
      order: sortOrder,
    }),
    [category, bias, status, sortField, sortOrder],
  );

  const isDefaultQuery =
    category === ALL && bias === ALL && status === ALL;

  const { data, isLoading, isError, error, refetch, isFetching } = useDecisions(
    query,
  );
  const decisions = data ?? (isDefaultQuery ? initialData : undefined);

  const resetFilters = () => {
    setCategory(ALL);
    setBias(ALL);
    setStatus(ALL);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface/60 p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex items-center gap-2 text-sm font-medium text-muted">
          <SlidersHorizontal className="size-4" />
          Filter
        </div>

        <FilterSelect
          value={category}
          onChange={setCategory}
          placeholder="Category"
          options={DECISION_CATEGORIES}
          allLabel="All categories"
        />
        <FilterSelect
          value={bias}
          onChange={setBias}
          placeholder="Bias"
          options={COGNITIVE_BIASES}
          allLabel="All biases"
        />
        <FilterSelect
          value={status}
          onChange={setStatus}
          placeholder="Status"
          options={DECISION_STATUSES}
          allLabel="Any status"
        />

        <div className="sm:ml-auto flex items-center gap-2">
          {!isDefaultQuery ? (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Clear
            </Button>
          ) : null}
          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="min-w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && !decisions ? (
        <DecisionListSkeleton />
      ) : isError ? (
        <ErrorState
          title="Couldn't load your decisions"
          description={
            error instanceof Error ? error.message : "Please try again."
          }
          onRetry={() => refetch()}
        />
      ) : !decisions || decisions.length === 0 ? (
        isDefaultQuery ? (
          <EmptyState
            icon={<ListChecks className="size-6" />}
            title="No decisions yet"
            description="Record your first decision and let Echoes analyse it."
            action={
              <Button asChild>
                <Link href="/decisions/new">
                  <Plus className="size-4" />
                  New decision
                </Link>
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={<SlidersHorizontal className="size-6" />}
            title="No matches"
            description="No decisions match the current filters."
            action={
              <Button variant="secondary" onClick={resetFilters}>
                Clear filters
              </Button>
            }
          />
        )
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 text-xs text-faint">
            <span>
              {decisions.length} decision{decisions.length === 1 ? "" : "s"}
            </span>
            {isFetching ? <span>Updating…</span> : null}
          </div>
          {decisions.map((decision) => (
            <DecisionCard key={decision.id} decision={decision} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
  allLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: readonly string[];
  allLabel: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="min-w-36">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt} className="capitalize">
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function DecisionListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-surface/70 p-5"
        >
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="mt-3 h-4 w-3/4" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-4 h-3 w-40" />
        </div>
      ))}
    </div>
  );
}
