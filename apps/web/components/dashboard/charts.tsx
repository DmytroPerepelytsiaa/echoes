import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 pt-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-faint">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
        </div>
        {icon ? (
          <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-surface-2 text-primary">
            {icon}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function HorizontalBars({
  title,
  data,
  tone = "primary",
  emptyLabel = "No data yet.",
}: {
  title: string;
  data: { label: string; count: number }[];
  tone?: "primary" | "accent";
  emptyLabel?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const barTone =
    tone === "accent"
      ? "from-accent/80 to-accent/40"
      : "from-primary/80 to-primary/40";

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">{emptyLabel}</p>
        ) : (
          <ul className="space-y-3">
            {data.slice(0, 7).map((d) => (
              <li key={d.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="truncate pr-2 text-foreground">
                    {d.label}
                  </span>
                  <span className="shrink-0 font-medium text-muted">
                    {d.count}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className={cn(
                      "h-full rounded-full bg-gradient-to-r",
                      barTone,
                    )}
                    style={{ width: `${(d.count / max) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function ActivityTimeline({
  data,
}: {
  data: { date: string; count: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Activity — last 14 days</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-32 items-end gap-1.5">
          {data.map((d) => {
            const heightPct = d.count === 0 ? 4 : (d.count / max) * 100;
            return (
              <div
                key={d.date}
                className="group relative flex flex-1 flex-col items-center justify-end"
                title={`${d.date}: ${d.count}`}
              >
                <div
                  className={cn(
                    "w-full rounded-t-sm transition-colors",
                    d.count === 0
                      ? "bg-surface-2"
                      : "bg-gradient-to-t from-primary/40 to-accent/80",
                  )}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-xs text-faint">
          <span>{data[0]?.date.slice(5)}</span>
          <span>{data[data.length - 1]?.date.slice(5)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
