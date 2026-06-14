import { requireUser } from "@/lib/session";
import { AppNav } from "@/components/site/app-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-dvh">
      <AppNav user={{ name: user.name, email: user.email }} />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
