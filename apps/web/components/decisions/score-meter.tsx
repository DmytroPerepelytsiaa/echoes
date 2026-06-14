import { cn } from "@/lib/utils";

export function ScoreMeter({
  label,
  value,
  max = 10,
  tone = "primary",
}: {
  label: string;
  value: number;
  max?: number;
  tone?: "primary" | "accent" | "success";
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const barTone = {
    primary: "from-primary to-info",
    accent: "from-accent to-primary",
    success: "from-success to-info",
  }[tone];

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium text-muted">{label}</span>
        <span className="text-sm font-semibold text-foreground">
          {value}
          <span className="text-xs text-faint">/{max}</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r", barTone)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
