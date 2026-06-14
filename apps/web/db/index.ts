import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Fall back to a URL-shaped placeholder so the module never throws at import
// time (e.g. during `next build` without secrets). Real queries will fail with
// a clear connection error until DATABASE_URL is set.
const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://placeholder:placeholder@localhost:5432/placeholder";

const sql = neon(connectionString);

export const db = drizzle(sql, { schema });

export { schema };
