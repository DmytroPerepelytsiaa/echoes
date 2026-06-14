"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { Decision } from "@/db/schema";
import type { DecisionInput, ListQuery } from "@/lib/validations";

/** A decision as serialised over JSON (timestamps become ISO strings). */
export type DecisionDTO = Omit<Decision, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

async function handle<T>(promise: Promise<Response>): Promise<T> {
  const res = await promise;
  if (!res.ok) {
    let message = `Request failed (${res.status}).`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export function buildListSearch(query: Partial<ListQuery>) {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.bias) params.set("bias", query.bias);
  if (query.status) params.set("status", query.status);
  if (query.sort) params.set("sort", query.sort);
  if (query.order) params.set("order", query.order);
  return params.toString();
}

export const decisionKeys = {
  all: ["decisions"] as const,
  list: (query: Partial<ListQuery>) => ["decisions", "list", query] as const,
  detail: (id: string) => ["decisions", "detail", id] as const,
  stats: ["stats"] as const,
};

/* ── Queries ─────────────────────────────────────────────────────────────── */

const hasInflight = (items: DecisionDTO[]) =>
  items.some((d) => d.status === "pending" || d.status === "processing");

export function useDecisions(query: Partial<ListQuery>) {
  return useQuery({
    queryKey: decisionKeys.list(query),
    queryFn: () =>
      handle<{ decisions: DecisionDTO[] }>(
        fetch(`/api/decisions?${buildListSearch(query)}`),
      ).then((r) => r.decisions),
    // Poll while any item is still being analysed.
    refetchInterval: (q) =>
      q.state.data && hasInflight(q.state.data) ? 2500 : false,
  });
}

export function useDecision(id: string, initialData?: DecisionDTO) {
  return useQuery({
    queryKey: decisionKeys.detail(id),
    queryFn: () =>
      handle<{ decision: DecisionDTO }>(fetch(`/api/decisions/${id}`)).then(
        (r) => r.decision,
      ),
    initialData,
    refetchInterval: (q) =>
      q.state.data &&
      (q.state.data.status === "pending" ||
        q.state.data.status === "processing")
        ? 2000
        : false,
  });
}

export type StatsResponse = {
  total: number;
  byStatus: Record<"pending" | "processing" | "completed" | "failed", number>;
  completed: number;
  byCategory: { label: string; count: number }[];
  byBias: { label: string; count: number }[];
  avgComplexity: number | null;
  avgQuality: number | null;
  timeline: { date: string; count: number }[];
};

export function useStats() {
  return useQuery({
    queryKey: decisionKeys.stats,
    queryFn: () => handle<StatsResponse>(fetch("/api/stats")),
  });
}

/* ── Mutations ───────────────────────────────────────────────────────────── */

export function useCreateDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DecisionInput) =>
      handle<{ decision: DecisionDTO }>(
        fetch("/api/decisions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        }),
      ).then((r) => r.decision),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: decisionKeys.all });
      qc.invalidateQueries({ queryKey: decisionKeys.stats });
    },
  });
}

export function useReanalyze() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      handle<{ decision: DecisionDTO }>(
        fetch(`/api/decisions/${id}/analyze`, { method: "POST" }),
      ).then((r) => r.decision),
    onSuccess: (decision) => {
      qc.setQueryData(decisionKeys.detail(decision.id), decision);
      qc.invalidateQueries({ queryKey: decisionKeys.all });
    },
  });
}

export function useDeleteDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      handle<{ success: true }>(
        fetch(`/api/decisions/${id}`, { method: "DELETE" }),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: decisionKeys.all });
      qc.invalidateQueries({ queryKey: decisionKeys.stats });
    },
  });
}
