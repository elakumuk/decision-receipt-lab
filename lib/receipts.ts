import { getServerSupabaseClient } from "@/lib/supabase";
import {
  buildPrecedentText,
  cosineSimilarity,
  lexicalSimilarity,
  parseStoredEmbedding,
} from "@/lib/precedents";
import type { CaseFileReceipt, HistoryEvent, PolicyPackId, SimilarCase } from "@/lib/schemas";

type ReceiptRow = {
  id: string;
  scenario: string;
  claimed_goal?: string | null;
  affected_parties?: CaseFileReceipt["affectedParties"] | null;
  authority_basis?: string | null;
  policy_pack?: PolicyPackId | null;
  evidence_used?: CaseFileReceipt["evidenceUsed"] | null;
  evidence_missing?: CaseFileReceipt["evidenceMissing"] | null;
  decision: CaseFileReceipt["decision"];
  severity?: CaseFileReceipt["severity"] | null;
  risk_score?: number | null;
  summary: string;
  signature?: string | null;
  embedding?: number[] | string | null;
  reasoning_for?: string[] | null;
  reasoning_against?: string[] | null;
  missing_information?: CaseFileReceipt["missingInformation"] | null;
  rule_trace: CaseFileReceipt["ruleTrace"];
  hash: string;
  created_at?: string | null;
};

type HistoryRow = {
  id: string;
  receipt_id: string;
  event_type: HistoryEvent["eventType"];
  actor_type: HistoryEvent["actorType"];
  actor_label?: string | null;
  note?: string | null;
  payload?: Record<string, unknown> | null;
  created_at?: string | null;
};

export type LedgerReceipt = {
  id: string;
  hash: string;
  previousHash: string | null;
  timestamp: string;
  verdict: CaseFileReceipt["decision"];
  severity: CaseFileReceipt["severity"];
  summary: string;
};

function buildReceiptText(row: Pick<ReceiptRow, "scenario" | "decision" | "summary" | "rule_trace">) {
  return buildPrecedentText({
    scenario: row.scenario,
    proposedAction: row.scenario,
    decision: row.decision,
    summary: row.summary,
    ruleTrace: row.rule_trace,
  });
}

function mapHistoryRows(rows: HistoryRow[] = []) {
  return rows.map(
    (row): HistoryEvent => ({
      id: row.id,
      receiptId: row.receipt_id,
      eventType: row.event_type,
      actorType: row.actor_type,
      actorLabel: row.actor_label ?? undefined,
      note: row.note ?? undefined,
      payload: row.payload ?? {},
      createdAt: row.created_at ?? new Date(0).toISOString(),
    }),
  );
}

function shortHash(hash: string) {
  return hash.slice(0, 12);
}

export function mapReceiptRowToCaseFileReceipt(
  row: ReceiptRow,
  historyRows: HistoryRow[] = [],
): CaseFileReceipt {
  const timestamp = row.created_at ?? new Date(0).toISOString();
  const history = mapHistoryRows(historyRows);

  return {
    scenario: row.scenario,
    decision: row.decision,
    proposedAction: row.scenario,
    claimedGoal: row.claimed_goal ?? "Claimed goal not stored for this case.",
    affectedParties: row.affected_parties ?? [],
    authorityBasis: row.authority_basis ?? "Authority basis not stored for this case.",
    policyPack: row.policy_pack ?? "general",
    evidenceUsed: row.evidence_used ?? [],
    evidenceMissing: row.evidence_missing ?? [],
    severity: row.severity ?? "medium",
    riskScore: row.risk_score ?? 50,
    summary: row.summary,
    whyOkay: row.reasoning_for ?? [],
    whyFail: row.reasoning_against ?? [],
    missingInformation: row.missing_information ?? [],
    ruleTrace: row.rule_trace,
    receiptId: row.id,
    hash: shortHash(row.hash),
    signature: row.signature ?? "",
    timestamp,
    receiptMetadata: {
      receiptId: row.id,
      hash: shortHash(row.hash),
      timestamp,
    },
    history,
    challengeHistory: history.filter((event) => event.eventType === "contested"),
  };
}

export async function getCaseFileById(id: string) {
  const supabase = getServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data: receiptRow, error } = await supabase
    .from("receipts")
    .select("*")
    .eq("id", id)
    .maybeSingle<ReceiptRow>();

  if (error || !receiptRow) {
    return null;
  }

  const { data: historyRows } = await supabase
    .from("receipt_history")
    .select("*")
    .eq("receipt_id", id)
    .order("created_at", { ascending: false })
    .returns<HistoryRow[]>();

  return mapReceiptRowToCaseFileReceipt(receiptRow, historyRows ?? []);
}

export async function getLedgerPage(page: number, pageSize = 50) {
  const supabase = getServerSupabaseClient();

  if (!supabase) {
    return {
      receipts: [] as LedgerReceipt[],
      totalCount: 0,
      totalPages: 0,
      page,
    };
  }

  const from = Math.max(0, (page - 1) * pageSize);
  const to = from + pageSize;

  const [{ data: rows, error }, countResult] = await Promise.all([
    supabase
      .from("receipts")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to)
      .returns<ReceiptRow[]>(),
    supabase.from("receipts").select("id", { count: "exact", head: true }),
  ]);

  if (error || !rows) {
    return {
      receipts: [] as LedgerReceipt[],
      totalCount: 0,
      totalPages: 0,
      page,
    };
  }

  const displayRows = rows.slice(0, pageSize);
  const receipts = displayRows.map((row, index) => ({
    id: row.id,
    hash: shortHash(row.hash),
    previousHash: rows[index + 1] ? shortHash(rows[index + 1].hash) : null,
    timestamp: row.created_at ?? new Date(0).toISOString(),
    verdict: row.decision,
    severity: row.severity ?? "medium",
    summary: row.summary,
  }));

  const totalCount = countResult.count ?? 0;

  return {
    receipts,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    page,
  };
}

export async function getSimilarReceipts(receiptId: string, limit = 3) {
  const supabase = getServerSupabaseClient();

  if (!supabase) {
    return [] as SimilarCase[];
  }

  const targetSelect = "id, scenario, decision, summary, rule_trace, embedding, created_at";
  const legacyTargetSelect = "id, scenario, decision, summary, rule_trace, created_at";

  const { data: targetRowWithEmbedding, error: targetError } = await supabase
    .from("receipts")
    .select(targetSelect)
    .eq("id", receiptId)
    .maybeSingle<ReceiptRow>();

  const targetMissingEmbedding =
    targetError?.code === "42703" || targetError?.message?.includes("embedding");

  const targetRow = targetMissingEmbedding
    ? (
        await supabase
          .from("receipts")
          .select(legacyTargetSelect)
          .eq("id", receiptId)
          .maybeSingle<ReceiptRow>()
      ).data
    : targetRowWithEmbedding;

  if (targetError || !targetRow) {
    if (!targetMissingEmbedding) {
      return [] as SimilarCase[];
    }
  }

  const candidateSelect = "id, scenario, decision, summary, rule_trace, hash, created_at, embedding";
  const legacyCandidateSelect = "id, scenario, decision, summary, rule_trace, hash, created_at";

  const { data: candidateRowsWithEmbedding, error: candidateError } = await supabase
    .from("receipts")
    .select(candidateSelect)
    .neq("id", receiptId)
    .order("created_at", { ascending: false })
    .limit(500)
    .returns<ReceiptRow[]>();

  const candidateMissingEmbedding =
    candidateError?.code === "42703" || candidateError?.message?.includes("embedding");

  const candidateRows = candidateMissingEmbedding
    ? (
        await supabase
          .from("receipts")
          .select(legacyCandidateSelect)
          .neq("id", receiptId)
          .order("created_at", { ascending: false })
          .limit(500)
          .returns<ReceiptRow[]>()
      ).data
    : candidateRowsWithEmbedding;

  if (candidateError || !candidateRows || candidateRows.length < 3) {
    if (!candidateMissingEmbedding) {
      return [] as SimilarCase[];
    }
  }

  if (!targetRow || !candidateRows || candidateRows.length < 3) {
    return [] as SimilarCase[];
  }

  const targetEmbedding = parseStoredEmbedding(targetRow.embedding);
  const targetText = buildReceiptText(targetRow);

  const ranked = candidateRows
    .map((row) => {
      const candidateEmbedding = parseStoredEmbedding(row.embedding);
      const similarity =
        targetEmbedding && candidateEmbedding
          ? cosineSimilarity(targetEmbedding, candidateEmbedding)
          : lexicalSimilarity(targetText, buildReceiptText(row));

      return {
        id: row.id,
        decision: row.decision,
        summary: row.summary,
        hash: shortHash(row.hash),
        timestamp: row.created_at ?? new Date(0).toISOString(),
        similarity,
      } satisfies SimilarCase;
    })
    .sort((left, right) => right.similarity - left.similarity)
    .slice(0, limit);

  return ranked;
}
