import { Brain, Compass, Quote, ThumbsUp } from "lucide-react";
import type { AnalysisResult } from "@/lib/validations";
import { BIAS_DESCRIPTIONS, type CognitiveBias } from "@/lib/taxonomy";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScoreMeter } from "./score-meter";
import { cn } from "@/lib/utils";

const SEVERITY_STYLES: Record<string, string> = {
  low: "border-faint/30 bg-surface-2 text-muted",
  medium: "border-warning/30 bg-warning/10 text-warning",
  high: "border-danger/30 bg-danger/10 text-danger",
};

export function AnalysisView({ analysis }: { analysis: AnalysisResult }) {
  return (
    <div className="space-y-5">
      {/* Summary + scores */}
      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="flex gap-3">
            <Quote className="size-5 shrink-0 text-accent" />
            <p className="text-pretty leading-relaxed text-foreground">
              {analysis.summary}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ScoreMeter
              label="Decision quality"
              value={analysis.quality}
              tone="success"
            />
            <ScoreMeter
              label="Complexity"
              value={analysis.complexity}
              tone="accent"
            />
          </div>
        </CardContent>
      </Card>

      {/* Cognitive biases */}
      <section>
        <SectionTitle icon={<Brain className="size-4" />}>
          Cognitive biases
        </SectionTitle>
        {analysis.biases.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface/60 px-4 py-3 text-sm text-muted">
            No significant cognitive biases were detected. Nicely reasoned.
          </p>
        ) : (
          <ul className="space-y-3">
            {analysis.biases.map((bias, i) => (
              <li
                key={`${bias.name}-${i}`}
                className="rounded-xl border border-border bg-surface/60 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <BiasName name={bias.name} />
                  <Badge
                    className={cn(
                      "capitalize",
                      SEVERITY_STYLES[bias.severity] ?? SEVERITY_STYLES.low,
                    )}
                  >
                    {bias.severity}
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {bias.explanation}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Missed alternatives */}
      <section>
        <SectionTitle icon={<Compass className="size-4" />}>
          Missed alternatives
        </SectionTitle>
        {analysis.missedAlternatives.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface/60 px-4 py-3 text-sm text-muted">
            No obvious overlooked alternatives.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {analysis.missedAlternatives.map((alt, i) => (
              <div
                key={`${alt.title}-${i}`}
                className="rounded-xl border border-border bg-surface/60 p-4"
              >
                <h4 className="text-sm font-semibold text-foreground">
                  {alt.title}
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {alt.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Strengths */}
      {analysis.strengths.length > 0 ? (
        <section>
          <SectionTitle icon={<ThumbsUp className="size-4" />}>
            What you did well
          </SectionTitle>
          <ul className="space-y-2">
            {analysis.strengths.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm text-muted"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-success" />
                {s}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function SectionTitle({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
      <span className="text-primary">{icon}</span>
      {children}
    </h3>
  );
}

function BiasName({ name }: { name: CognitiveBias }) {
  const description = BIAS_DESCRIPTIONS[name];
  if (!description) {
    return <span className="font-semibold text-foreground">{name}</span>;
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help font-semibold text-foreground underline decoration-dotted decoration-faint underline-offset-4">
          {name}
        </span>
      </TooltipTrigger>
      <TooltipContent>{description}</TooltipContent>
    </Tooltip>
  );
}
