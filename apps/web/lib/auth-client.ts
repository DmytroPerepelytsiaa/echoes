"use client";

import { createAuthClient } from "better-auth/react";

// Explicit annotation avoids TS2742 (non-portable inferred type) under
// moduleResolution: "bundler".
export const authClient: ReturnType<typeof createAuthClient> =
  createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  });

export const { signIn, signUp, signOut, useSession } = authClient;
