import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DecisionsBrowser } from "@/components/decisions/decisions-browser";

export const metadata: Metadata = { title: "Decisions" };

export default function DecisionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your decisions</h1>
          <p className="mt-1 text-muted">
            Every decision you&apos;ve recorded, with its analysis and status.
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/decisions/new">
            <Plus className="size-4" />
            New decision
          </Link>
        </Button>
      </div>

      <DecisionsBrowser />
    </div>
  );
}
