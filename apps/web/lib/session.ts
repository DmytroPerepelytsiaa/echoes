import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Returns the current BetterAuth session (or null) from the request cookies. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Server-component guard: redirects to /login when unauthenticated. */
export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session.user;
}

/**
 * Route-handler guard: returns the user id or null. Handlers respond with 401
 * themselves so they can return JSON rather than redirect.
 */
export async function getUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user.id ?? null;
}
