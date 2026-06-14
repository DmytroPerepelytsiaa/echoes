import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const firstName = user.name.split(" ")[0] || "there";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-muted">
            Patterns across your decisions and the biases behind them.
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/decisions/new">
            <Plus className="size-4" />
            New decision
          </Link>
        </Button>
      </div>

      <DashboardView />
    </div>
  );
}
