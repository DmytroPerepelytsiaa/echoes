import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Brain, Compass, Layers, Sparkles } from "lucide-react";
import { getSession } from "@/lib/session";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Layers,
    title: "Decision category",
    description:
      "Every entry is classified — career, finance, relationships and more — so patterns surface over time.",
  },
  {
    icon: Brain,
    title: "Cognitive biases",
    description:
      "The model flags likely biases — sunk cost, confirmation, overconfidence — with a one-line rationale each.",
  },
  {
    icon: Compass,
    title: "Missed alternatives",
    description:
      "See the plausible options you may have overlooked, so the next call is better informed.",
  },
];

export default async function LandingPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="relative min-h-dvh bg-grid">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Get started</Link>
          </Button>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        <section className="flex flex-col items-center pb-20 pt-16 text-center md:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider text-muted">
            <Sparkles className="size-3.5 text-accent" />
            AI decision insights
          </span>

          <h1 className="mt-7 max-w-3xl text-balance text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Understand the quality of
            <br className="hidden sm:block" /> your{" "}
            <span className="text-gradient">hardest decisions</span>
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-lg text-muted">
            Record a complex life or work decision. Echoes analyses it with an
            LLM and returns its category, the cognitive biases at play, and the
            alternatives you may have missed.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup">
                Start analysing <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/login">I already have an account</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 pb-24 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border bg-surface/70 p-6 transition-colors hover:border-border-strong"
            >
              <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-surface-2 text-primary">
                <feature.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {feature.description}
              </p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-faint sm:flex-row">
          <Logo />
          <p>Built with Next.js, BetterAuth, Drizzle &amp; Groq.</p>
        </div>
      </footer>
    </div>
  );
}
