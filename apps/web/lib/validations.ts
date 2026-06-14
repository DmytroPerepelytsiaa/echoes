import { z } from "zod";
import {
  BIAS_SEVERITIES,
  COGNITIVE_BIASES,
  DECISION_CATEGORIES,
} from "./taxonomy";

/* ── Decision input (create form + POST /api/decisions) ──────────────────── */

export const decisionInputSchema = z.object({
  situation: z
    .string()
    .trim()
    .min(20, "Describe the situation in at least 20 characters.")
    .max(4000, "Keep the situation under 4000 characters."),
  decision: z
    .string()
    .trim()
    .min(5, "Describe the decision you made (at least 5 characters).")
    .max(2000, "Keep the decision under 2000 characters."),
  reasoning: z
    .string()
    .trim()
    .max(2000, "Keep your reasoning under 2000 characters.")
    .optional()
    .or(z.literal("")),
});

export type DecisionInput = z.infer<typeof decisionInputSchema>;

/* ── LLM structured output (also stored in `decisions.analysis`) ─────────── */

export const analysisSchema = z.object({
  category: z
    .enum(DECISION_CATEGORIES)
    .describe("The single best-fitting category for this decision."),
  complexity: z
    .number()
    .int()
    .min(1)
    .max(10)
    .describe("How complex/high-stakes the decision is, from 1 (simple) to 10 (life-changing)."),
  quality: z
    .number()
    .int()
    .min(1)
    .max(10)
    .describe("An honest assessment of the decision quality given the reasoning, 1 (poor) to 10 (excellent)."),
  summary: z
    .string()
    .describe("A concise 2-3 sentence insight into the quality of this decision."),
  biases: z
    .array(
      z.object({
        name: z
          .enum(COGNITIVE_BIASES)
          .describe("The closest matching cognitive bias from the provided list."),
        severity: z.enum(BIAS_SEVERITIES),
        explanation: z
          .string()
          .describe("One sentence on how this bias may have influenced the decision."),
      }),
    )
    .max(5)
    .describe("Cognitive biases likely at play. Empty if none are evident."),
  missedAlternatives: z
    .array(
      z.object({
        title: z.string().describe("A short label for the overlooked alternative."),
        description: z
          .string()
          .describe("One or two sentences explaining the alternative and why it was worth considering."),
      }),
    )
    .max(5)
    .describe("Plausible alternatives the person may not have fully considered."),
  strengths: z
    .array(z.string())
    .max(4)
    .describe("What was done well in this decision-making process."),
});

export type AnalysisResult = z.infer<typeof analysisSchema>;

/* ── History list query params (filters + sorting) ──────────────────────── */

export const SORT_FIELDS = ["createdAt", "complexity"] as const;
export const SORT_ORDERS = ["asc", "desc"] as const;
export const DECISION_STATUSES = [
  "pending",
  "processing",
  "completed",
  "failed",
] as const;

export type DecisionStatus = (typeof DECISION_STATUSES)[number];

export const listQuerySchema = z.object({
  category: z.enum(DECISION_CATEGORIES).optional(),
  bias: z.enum(COGNITIVE_BIASES).optional(),
  status: z.enum(DECISION_STATUSES).optional(),
  sort: z.enum(SORT_FIELDS).default("createdAt"),
  order: z.enum(SORT_ORDERS).default("desc"),
});

export type ListQuery = z.infer<typeof listQuerySchema>;

/* ── Auth forms ─────────────────────────────────────────────────────────── */

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80),
  email: z.email("Enter a valid email."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128),
});

export const signInSchema = z.object({
  email: z.email("Enter a valid email."),
  password: z.string().min(1, "Enter your password."),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
