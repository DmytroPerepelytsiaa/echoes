"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  useDecision,
  useDeleteDecision,
  useReanalyze,
  type DecisionDTO,
} from "@/lib/decisions-client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/utils";
import { AnalysisView } from "./analysis-view";

export function DecisionDetail({
  id,
  initialData,
}: {
  id: string;
  initialData: DecisionDTO;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: decision } = useDecision(id, initialData);
  const reanalyze = useReanalyze();
  const remove = useDeleteDecision();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const current = decision ?? initialData;
  const inFlight =
    current.status === "pending" || current.status === "processing";

  async function handleReanalyze() {
    try {
      await reanalyze.mutateAsync(id);
      toast({ variant: "success", title: "Re-analysis started" });
    } catch (err) {
      toast({
        variant: "error",
        title: "Could not start analysis",
        description: err instanceof Error ? err.message : undefined,
      });
    }
  }

  async function handleDelete() {
    try {
      await remove.mutateAsync(id);
      toast({ variant: "success", title: "Decision deleted" });
      router.push("/decisions");
      router.refresh();
    } catch (err) {
      toast({
        variant: "error",
        title: "Could not delete",
        description: err instanceof Error ? err.message : undefined,
      });
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/decisions"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to decisions
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={current.status} />
            {current.category ? (
              <Badge variant="primary">{current.category}</Badge>
            ) : null}
          </div>
          <p className="text-xs text-faint">
            Recorded {formatDateTime(current.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReanalyze}
            loading={reanalyze.isPending}
            disabled={inFlight}
          >
            <RefreshCw className="size-4" />
            Re-analyse
          </Button>

          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Delete decision">
                <Trash2 className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete this decision?</DialogTitle>
                <DialogDescription>
                  This permanently removes the decision and its analysis. This
                  can&apos;t be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  loading={remove.isPending}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <Field label="Situation">{current.situation}</Field>
          <Field label="Decision">{current.decision}</Field>
          {current.reasoning ? (
            <Field label="Their reasoning">{current.reasoning}</Field>
          ) : null}
        </CardContent>
      </Card>

      {current.status === "completed" && current.analysis ? (
        <AnalysisView analysis={current.analysis} />
      ) : current.status === "failed" ? (
        <AnalysisFailed
          message={current.error}
          onRetry={handleReanalyze}
          retrying={reanalyze.isPending}
        />
      ) : (
        <AnalysisPending status={current.status} />
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-faint">
        {label}
      </p>
      <p className="whitespace-pre-wrap text-pretty leading-relaxed text-foreground">
        {children}
      </p>
    </div>
  );
}

function AnalysisPending({ status }: { status: DecisionDTO["status"] }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-14 text-center">
        <Loader2 className="size-7 animate-spin text-primary" />
        <div>
          <p className="font-medium text-foreground">
            {status === "pending"
              ? "Queued for analysis…"
              : "Analysing your decision…"}
          </p>
          <p className="mt-1 text-sm text-muted">
            This usually takes a few seconds. The page updates automatically —
            no need to refresh.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalysisFailed({
  message,
  onRetry,
  retrying,
}: {
  message: string | null;
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <Card className="border-danger/30 bg-danger/5">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <div className="flex size-11 items-center justify-center rounded-xl border border-danger/30 bg-danger/10 text-danger">
          <AlertTriangle className="size-5" />
        </div>
        <div>
          <p className="font-medium text-foreground">Analysis failed</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">
            {message ?? "Something went wrong while analysing this decision."}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          loading={retrying}
        >
          <RefreshCw className="size-4" />
          Retry analysis
        </Button>
      </CardContent>
    </Card>
  );
}
