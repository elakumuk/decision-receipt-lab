import { ClassifyDecisionInput } from "@/lib/schemas";
import { getOpenAIClient } from "@/lib/openai";

type ClassificationResult = {
  label: "ship" | "rethink" | "escalate";
  confidence: number;
  summary: string;
  nextSteps: string[];
  source: "heuristic" | "openai";
};

function heuristicClassification(input: ClassifyDecisionInput): ClassificationResult {
  const text = `${input.decision} ${input.context}`.toLowerCase();
  const riskSignals = ["legal", "security", "breach", "fired", "layoff", "regulator"];
  const uncertainSignals = ["maybe", "probably", "guess", "unsure", "experiment"];
  const riskCount = riskSignals.filter((signal) => text.includes(signal)).length;
  const uncertaintyCount = uncertainSignals.filter((signal) => text.includes(signal)).length;

  if (input.stakes === "high" || riskCount > 0) {
    return {
      label: "escalate",
      confidence: 0.83,
      summary: "This decision carries enough downside that it should be reviewed before execution.",
      nextSteps: [
        "Document the irreversible consequences.",
        "Add one reviewer with domain authority.",
        "Set a rollback checkpoint before acting.",
      ],
      source: "heuristic",
    };
  }

  if (uncertaintyCount > 1) {
    return {
      label: "rethink",
      confidence: 0.72,
      summary: "The rationale sounds tentative, so the decision needs sharper framing before it becomes a commitment.",
      nextSteps: [
        "Rewrite the decision as a single sentence.",
        "List the strongest alternative you are rejecting.",
        "Define one metric that would prove this was the right call.",
      ],
      source: "heuristic",
    };
  }

  return {
    label: "ship",
    confidence: 0.76,
    summary: "The decision is specific enough to move forward with a visible record of why it was made.",
    nextSteps: [
      "Capture the intended outcome and owner.",
      "Share the receipt with anyone affected.",
      "Review the result after the first milestone.",
    ],
    source: "heuristic",
  };
}

export async function classifyDecision(input: ClassifyDecisionInput): Promise<ClassificationResult> {
  const client = getOpenAIClient();

  if (!client) {
    return heuristicClassification(input);
  }

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: "Classify decisions into ship, rethink, or escalate. Return compact JSON with label, confidence, summary, and nextSteps.",
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: JSON.stringify(input),
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "decision_receipt_classification",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            label: {
              type: "string",
              enum: ["ship", "rethink", "escalate"],
            },
            confidence: {
              type: "number",
              minimum: 0,
              maximum: 1,
            },
            summary: {
              type: "string",
            },
            nextSteps: {
              type: "array",
              items: { type: "string" },
              minItems: 2,
              maxItems: 4,
            },
          },
          required: ["label", "confidence", "summary", "nextSteps"],
        },
      },
    },
  });

  const parsed = JSON.parse(response.output_text) as Omit<ClassificationResult, "source">;

  return {
    ...parsed,
    source: "openai",
  };
}
