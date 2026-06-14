import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DecisionForm } from "@/components/decisions/decision-form";

export const metadata: Metadata = { title: "New decision" };

export default function NewDecisionPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/decisions"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to decisions
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">Record a decision</h1>
      <p className="mt-1 mb-6 text-muted">
        Describe a decision you&apos;ve already made. Echoes will analyse it and
        surface insights.
      </p>
      <DecisionForm />
    </div>
  );
}
