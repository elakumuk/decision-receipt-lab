import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import {
  suggestFixRequestSchema,
  suggestFixResponseSchema,
  type CaseFileReceipt,
  type FixSuggestion,
} from "@/lib/schemas";

const SUGGEST_FIX_PROMPT = `You are an AI governance remediation assistant.

You will receive a full Ovrule case file with:
- proposed action
- claimed goal
- final verdict
- rule trace
- evidence used
- evidence missing
- missing information
- whyOkay / whyFail

Your task:
Suggest 2 to 4 concrete edits that would most improve the case and flip the failing or warning rules toward PASS.

Rules:
- Prioritize edits that are operationally realistic.
- Be specific, not generic.
- Prefer minimal changes that preserve the original goal.
- Only suggest changes supported by the case facts and missing-information gaps.
- Do not invent new facts as if they already exist.
- Each rewrittenAction must be a clean revised version of the proposed action with the suggested fix applied.
- Each flips entry must name only plausible rule movements, such as:
  - "AUTHORIZATION: WARN -> PASS"
  - "CONSENT: FAIL -> WARN"
- If a full PASS is unrealistic, still suggest the strongest plausible improvement.
- Output valid JSON matching the provided schema exactly.`;

const suggestFixJsonSchema = {
  name: "suggest_fix_response",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      suggestions: {
        type: "array",
        minItems: 2,
        maxItems: 4,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            edit: { type: "string" },
            flips: {
              type: "array",
              items: { type: "string" },
            },
            rewrittenAction: { type: "string" },
          },
          required: ["edit", "flips", "rewrittenAction"],
        },
      },
    },
    required: ["suggestions"],
  },
} as const;

function heuristicSuggestions(receipt: CaseFileReceipt): FixSuggestion[] {
  const baseAction = receipt.proposedAction;
  const suggestions: FixSuggestion[] = [];

  const hasAuthorizationIssue = receipt.ruleTrace.some(
    (item) => item.rule === "AUTHORIZATION" && item.verdict !== "PASS",
  );
  const hasConsentIssue = receipt.ruleTrace.some(
    (item) => item.rule === "CONSENT" && item.verdict !== "PASS",
  );
  const hasSafetyIssue = receipt.ruleTrace.some(
    (item) => item.rule === "SAFETY" && item.verdict !== "PASS",
  );

  if (hasAuthorizationIssue) {
    suggestions.push({
      edit: "Add explicit approval from the responsible reviewer before the agent executes the action.",
      flips: ["AUTHORIZATION: WARN -> PASS", "IMPACT SCOPE: WARN -> PASS"],
      rewrittenAction: `${baseAction} only after explicit approval from the responsible reviewer is recorded.`,
    });
  }

  if (hasConsentIssue) {
    suggestions.push({
      edit: "Require notice and opt-in confirmation from the affected party before the action runs.",
      flips: ["CONSENT: WARN -> PASS"],
      rewrittenAction: `${baseAction} only after the affected party is notified and confirms consent.`,
    });
  }

  if (hasSafetyIssue) {
    suggestions.push({
      edit: "Add an out-of-band verification step and a manual checkpoint for high-risk consequences.",
      flips: ["SAFETY: FAIL -> WARN", "CAUSAL VALIDITY: WARN -> PASS"],
      rewrittenAction: `${baseAction} only after an out-of-band verification step and manual checkpoint confirm the facts.`,
    });
  }

  suggestions.push({
    edit: "Limit the blast radius by running the action on a smaller scope first with rollback enabled.",
    flips: ["REVERSIBILITY: WARN -> PASS", "IMPACT SCOPE: WARN -> PASS"],
    rewrittenAction: `${baseAction} in a limited pilot first, with rollback enabled before broader execution.`,
  });

  return suggestions.slice(0, 4);
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { receipt } = suggestFixRequestSchema.parse(payload);
    const client = getOpenAIClient();

    if (!client) {
      return NextResponse.json({
        suggestions: heuristicSuggestions(receipt),
      });
    }

    const response = await client.responses.create({
      model: "gpt-4o-mini-2024-07-18",
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: SUGGEST_FIX_PROMPT }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: JSON.stringify({ receipt }) }],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          ...suggestFixJsonSchema,
        },
      },
    });

    const parsed = suggestFixResponseSchema.parse(JSON.parse(response.output_text));
    return NextResponse.json(parsed);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid request body." },
        { status: 400 },
      );
    }

    console.error("Suggest fix request failed", error);
    return NextResponse.json(
      { error: "Unable to suggest fixes right now." },
      { status: 503 },
    );
  }
}
