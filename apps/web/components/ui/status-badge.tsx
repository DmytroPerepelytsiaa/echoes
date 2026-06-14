import { CheckCircle2, Clock, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DecisionStatus } from "@/lib/validations";

const STATUS_CONFIG: Record<
  DecisionStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Queued",
    className: "border-faint/30 bg-surface-2 text-muted",
    icon: <Clock className="size-3.5" />,
  },
  processing: {
    label: "Analyzing",
    className: "border-info/30 bg-info/10 text-info",
    icon: <Loader2 className="size-3.5 animate-spin" />,
  },
  completed: {
    label: "Ready",
    className: "border-success/30 bg-success/10 text-success",
    icon: <CheckCircle2 className="size-3.5" />,
  },
  failed: {
    label: "Failed",
    className: "border-danger/30 bg-danger/10 text-danger",
    icon: <AlertTriangle className="size-3.5" />,
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: DecisionStatus;
  className?: string;
}) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className,
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
