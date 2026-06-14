export const DECISION_CATEGORIES = [
  "Career",
  "Finance",
  "Relationships",
  "Health",
  "Business",
  "Education",
  "Personal Growth",
  "Lifestyle",
  "Other",
] as const;

export type DecisionCategory = (typeof DECISION_CATEGORIES)[number];

export const COGNITIVE_BIASES = [
  "Confirmation Bias",
  "Sunk Cost Fallacy",
  "Anchoring Bias",
  "Overconfidence Bias",
  "Loss Aversion",
  "Availability Heuristic",
  "Status Quo Bias",
  "Hindsight Bias",
  "Framing Effect",
  "Bandwagon Effect",
  "Optimism Bias",
  "Recency Bias",
  "Authority Bias",
  "Dunning-Kruger Effect",
  "Planning Fallacy",
  "Self-Serving Bias",
  "Other",
] as const;

export type CognitiveBias = (typeof COGNITIVE_BIASES)[number];

export const BIAS_SEVERITIES = ["low", "medium", "high"] as const;
export type BiasSeverity = (typeof BIAS_SEVERITIES)[number];

export const BIAS_DESCRIPTIONS: Partial<Record<CognitiveBias, string>> = {
  "Confirmation Bias": "Favoring information that confirms existing beliefs.",
  "Sunk Cost Fallacy": "Continuing because of already-invested resources.",
  "Anchoring Bias": "Over-relying on the first piece of information seen.",
  "Overconfidence Bias": "Overestimating the accuracy of your judgments.",
  "Loss Aversion": "Weighting potential losses more than equivalent gains.",
  "Availability Heuristic": "Judging likelihood by how easily examples come to mind.",
  "Status Quo Bias": "Preferring things to stay the same.",
  "Hindsight Bias": "Seeing past events as more predictable than they were.",
  "Framing Effect": "Being swayed by how options are presented.",
  "Bandwagon Effect": "Adopting beliefs because many others hold them.",
  "Optimism Bias": "Believing you're less at risk of negative outcomes.",
  "Recency Bias": "Over-weighting the most recent information.",
  "Authority Bias": "Over-trusting the opinion of an authority figure.",
  "Dunning-Kruger Effect": "Low ability paired with inflated self-assessment.",
  "Planning Fallacy": "Underestimating time, costs and risks of action.",
  "Self-Serving Bias": "Crediting successes to self, failures to circumstance.",
};
