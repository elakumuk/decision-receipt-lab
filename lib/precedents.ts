import { getOpenAIClient } from "@/lib/openai";
import type { CaseFileReceipt } from "@/lib/schemas";

const EMBEDDING_MODEL = "text-embedding-3-small";

type ReceiptLike = Pick<
  CaseFileReceipt,
  "proposedAction" | "decision" | "summary" | "ruleTrace" | "scenario"
>;

export function buildPrecedentText(receipt: ReceiptLike) {
  const ruleSummary = receipt.ruleTrace
    .map((rule) => `${rule.rule}: ${rule.verdict} — ${rule.reason}`)
    .join(" | ");

  return [
    `Scenario: ${receipt.scenario}`,
    `Proposed action: ${receipt.proposedAction}`,
    `Decision: ${receipt.decision}`,
    `Summary: ${receipt.summary}`,
    `Rule trace: ${ruleSummary}`,
  ].join("\n");
}

export async function generateReceiptEmbedding(receipt: ReceiptLike) {
  const client = getOpenAIClient();

  if (!client) {
    return null;
  }

  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: buildPrecedentText(receipt),
  });

  return response.data[0]?.embedding ?? null;
}

export function parseStoredEmbedding(value: unknown): number[] | null {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value.map((item) => Number(item));
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    try {
      return JSON.parse(trimmed);
    } catch {
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        return trimmed
          .slice(1, -1)
          .split(",")
          .map((item) => Number(item.trim()))
          .filter((item) => Number.isFinite(item));
      }
    }
  }

  return null;
}

export function cosineSimilarity(left: number[], right: number[]) {
  if (left.length === 0 || right.length === 0 || left.length !== right.length) {
    return 0;
  }

  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;

  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftNorm += left[index] * left[index];
    rightNorm += right[index] * right[index];
  }

  if (leftNorm === 0 || rightNorm === 0) {
    return 0;
  }

  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}

export function lexicalSimilarity(left: string, right: string) {
  const tokenize = (value: string) =>
    new Set(
      value
        .toLowerCase()
        .split(/[^a-z0-9]+/g)
        .filter((token) => token.length > 2),
    );

  const leftTokens = tokenize(left);
  const rightTokens = tokenize(right);

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  let overlap = 0;

  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      overlap += 1;
    }
  }

  return overlap / Math.max(leftTokens.size, rightTokens.size);
}
