import { createGroq } from "@ai-sdk/groq";
import { generateText, Output } from "ai";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { decisions } from "@/db/schema";
import { analysisSchema } from "@/lib/validations";
import { COGNITIVE_BIASES, DECISION_CATEGORIES } from "@/lib/taxonomy";

// gpt-oss-120b is on Groq's free tier and supports strict json_schema
// structured outputs, which `generateObject` relies on for reliable results.
const DEFAULT_MODEL = "openai/gpt-oss-120b";

const SYSTEM_PROMPT = `You are a rigorous decision-science analyst. A user describes a complex life or work decision they already made. Your job is to give an honest, insightful, and concrete assessment that helps them understand the quality of that decision.

Rules:
- Pick the SINGLE best category from this fixed list: ${DECISION_CATEGORIES.join(", ")}.
- For each cognitive bias, choose the closest match from this fixed list: ${COGNITIVE_BIASES.join(", ")}. Only include biases that are genuinely supported by the text. If none apply, return an empty array. Never invent evidence.
- "missedAlternatives" must be realistic options the person plausibly overlooked, not generic filler.
- Be specific and reference the user's own details. Avoid hedging and platitudes.
- "quality" is your candid score of how well-reasoned the decision was given what they wrote.
- Keep every explanation to one or two sentences.`;

function buildPrompt(input: {
  situation: string;
  decision: string;
  reasoning?: string | null;
}) {
  return [
    `SITUATION:\n${input.situation}`,
    `DECISION MADE:\n${input.decision}`,
    input.reasoning?.trim()
      ? `THEIR OWN REASONING:\n${input.reasoning.trim()}`
      : `THEIR OWN REASONING:\n(not provided)`,
    `\nAnalyze this decision and return the structured assessment.`,
  ].join("\n\n");
}

/**
 * Calls Groq to produce the structured analysis. Tries strict json_schema
 * structured output first; if the chosen model doesn't support it, falls back
 * to best-effort json_object mode (works across all Groq models).
 */
async function generateAnalysis(
  modelId: string,
  row: { situation: string; decision: string; reasoning: string | null },
) {
  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
  const base = {
    model: groq(modelId),
    output: Output.object({
      schema: analysisSchema,
      name: "DecisionAnalysis",
      description: "Structured analysis of a decision's quality.",
    }),
    system: SYSTEM_PROMPT,
    prompt: buildPrompt(row),
    temperature: 0.3,
  };

  try {
    const { output } = await generateText(base);
    return output;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const schemaUnsupported = /json[_ ]?schema|response.?format|structured/i.test(
      message,
    );
    if (!schemaUnsupported) throw err;

    // Some Groq models don't support strict json_schema — retry in best-effort
    // json_object mode, which works across all Groq models.
    const { output } = await generateText({
      ...base,
      providerOptions: { groq: { structuredOutputs: false } },
    });
    return output;
  }
}

/**
 * Runs the LLM analysis for a single decision and persists the result.
 * Designed to be called in the background (via `after()`) or on demand
 * (re-analyze / retry). It owns the full status lifecycle and never throws —
 * failures are recorded on the row so the UI can show a retry affordance.
 */
export async function runAnalysis(decisionId: string): Promise<void> {
  await db
    .update(decisions)
    .set({ status: "processing", error: null })
    .where(eq(decisions.id, decisionId));

  const [row] = await db
    .select()
    .from(decisions)
    .where(eq(decisions.id, decisionId))
    .limit(1);

  if (!row) return;

  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error(
        "GROQ_API_KEY is not configured. Add it to .env.local (see .env.example).",
      );
    }

    const modelId = process.env.GROQ_MODEL || DEFAULT_MODEL;
    const object = await generateAnalysis(modelId, row);

    const biasTypes = Array.from(new Set(object.biases.map((b) => b.name)));

    await db
      .update(decisions)
      .set({
        status: "completed",
        analysis: object,
        category: object.category,
        complexity: object.complexity,
        biasTypes,
        error: null,
      })
      .where(eq(decisions.id, decisionId));
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "The analysis failed unexpectedly.";
    await db
      .update(decisions)
      .set({ status: "failed", error: message })
      .where(eq(decisions.id, decisionId));
  }
}
