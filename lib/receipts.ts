import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { CaseFileReceipt, HistoryEvent } from "@/lib/schemas";

type ReceiptRow = {
  id: string;
  scenario: string;
  claimed_goal?: string | null;
  affected_parties?: CaseFileReceipt["affectedParties"] | null;
  authority_basis?: string | null;
  evidence_used?: CaseFileReceipt["evidenceUsed"] | null;
  evidence_missing?: CaseFileReceipt["evidenceMissing"] | null;
  decision: CaseFileReceipt["decision"];
  severity?: CaseFileReceipt["severity"] | null;
  risk_score?: number | null;
  summary: string;
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

function getServerSupabaseClient() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return null;
  }

  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false },
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
